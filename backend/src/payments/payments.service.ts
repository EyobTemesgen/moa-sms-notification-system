import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE } from '../database/drizzle.provider';
import * as schema from '../database/schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SmsService } from '../sms/sms.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private readonly smsService: SmsService,
    private readonly settingsService: SettingsService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, currentUser: any) {
    // Check for duplicate voucherRef
    const existing = await this.db.query.payments.findFirst({
      where: eq(schema.payments.voucherRef, createPaymentDto.voucherRef),
    });
    if (existing) {
      throw new BadRequestException(`A payment with voucher reference "${createPaymentDto.voucherRef}" already exists`);
    }

    // Check system threshold
    const settings = await this.settingsService.getSettings();
    const threshold = parseFloat(settings.thresholdAmount) || 20000000;
    const isAboveThreshold = createPaymentDto.amount >= threshold;

    // Insert payment
    const [payment] = await this.db
      .insert(schema.payments)
      .values({
        voucherRef: createPaymentDto.voucherRef,
        payeeName: createPaymentDto.payeeName,
        amount: createPaymentDto.amount.toString(),
        category: createPaymentDto.category,
        paymentMethod: createPaymentDto.paymentMethod || 'Bank Transfer',
        paymentDate: createPaymentDto.paymentDate,
        notes: createPaymentDto.notes || null,
        createdById: currentUser.id,
        requiresAlert: isAboveThreshold,
      })
      .returning();

    // Trigger SMS alert asynchronously if above threshold
    if (isAboveThreshold && settings.isAlertEnabled) {
      // Trigger in background so payment submission remains fast and responsive
      this.smsService.sendAlertForPayment(payment, currentUser).catch((err) => {
        console.error('Failed to send SMS alerts for payment:', err);
      });
    }

    return {
      ...payment,
      triggeredAlert: isAboveThreshold,
      threshold,
    };
  }

  async findAll(limit = 100) {
    return this.db.query.payments.findMany({
      orderBy: [desc(schema.payments.createdAt)],
      limit,
      with: {
        createdBy: true,
        alerts: true,
      },
    });
  }

  async findOne(id: string) {
    const payment = await this.db.query.payments.findFirst({
      where: eq(schema.payments.id, id),
      with: {
        createdBy: true,
        alerts: true,
      },
    });
    return payment;
  }

  async getStats() {
    const allPayments = await this.db.query.payments.findMany();
    const settings = await this.settingsService.getSettings();
    const threshold = parseFloat(settings.thresholdAmount) || 20000000;

    let totalAmount = 0;
    let highValueCount = 0;
    let highValueAmount = 0;

    for (const p of allPayments) {
      const amt = parseFloat(p.amount) || 0;
      totalAmount += amt;
      if (amt >= threshold) {
        highValueCount += 1;
        highValueAmount += amt;
      }
    }

    const allAlerts = await this.db.query.smsAlerts.findMany();
    const sentAlerts = allAlerts.filter((a: any) => a.status === 'SENT').length;
    const failedAlerts = allAlerts.filter((a: any) => a.status === 'FAILED').length;

    return {
      totalPayments: allPayments.length,
      totalAmount,
      highValueCount,
      highValueAmount,
      currentThreshold: threshold,
      totalAlerts: allAlerts.length,
      sentAlerts,
      failedAlerts,
    };
  }
}

