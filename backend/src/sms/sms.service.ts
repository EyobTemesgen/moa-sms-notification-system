import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE } from '../database/drizzle.provider';
import * as schema from '../database/schema';
import { MockSmsProvider } from './providers/mock-sms.provider';
import { HttpSmsProvider } from './providers/http-sms.provider';
import { SmsSendResult } from './interfaces/sms-provider.interface';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @Inject(DRIZZLE) private db: any,
    private configService: ConfigService,
    private mockProvider: MockSmsProvider,
    private httpProvider: HttpSmsProvider,
  ) {}

  private async getActiveSettings() {
    const settings = await this.db.query.systemSettings.findFirst();
    return settings || {
      smsProvider: this.configService.get<string>('sms.provider', 'mock'),
      smsGatewayUrl: this.configService.get<string>('sms.gatewayUrl', ''),
      smsGatewayKey: this.configService.get<string>('sms.gatewayApiKey', ''),
      smsSenderId: this.configService.get<string>('sms.senderId', 'MOA-FINANCE'),
      isAlertEnabled: true,
    };
  }

  async sendAlertForPayment(payment: any, createdByUser?: any) {
    const settings = await this.getActiveSettings();
    if (!settings.isAlertEnabled) {
      this.logger.warn(`SMS Alert disabled in system settings. Skipping alert for payment ${payment.voucherRef}`);
      return;
    }

    // Get active manager recipients
    const recipients = await this.db.query.alertRecipients.findMany({
      where: eq(schema.alertRecipients.isActive, true),
    });

    if (!recipients || recipients.length === 0) {
      this.logger.warn(`No active recipients configured. No SMS sent for payment ${payment.voucherRef}`);
      return;
    }

    const formattedAmount = Number(payment.amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const officerName = createdByUser?.fullName || 'Finance Office';
    const message = `MOA Payment Alert: High-value payment of ETB ${formattedAmount} issued to "${payment.payeeName}" (Ref: ${payment.voucherRef}) for ${payment.category}. Recorded by ${officerName} on ${payment.paymentDate}.`;

    const provider = settings.smsProvider === 'http' ? this.httpProvider : this.mockProvider;

    for (const recipient of recipients) {
      this.logger.log(`Queueing SMS alert to ${recipient.name} (${recipient.phoneNumber})`);

      let result: SmsSendResult;
      try {
        result = await provider.sendSms({
          recipientNumber: recipient.phoneNumber,
          recipientName: recipient.name,
          message,
          senderId: settings.smsSenderId,
          gatewayUrl: settings.smsGatewayUrl,
          apiKey: settings.smsGatewayKey,
        });
      } catch (err: any) {
        result = {
          success: false,
          error: err.message,
        };
      }

      await this.db.insert(schema.smsAlerts).values({
        paymentId: payment.id,
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientNumber: recipient.phoneNumber,
        message,
        status: result.success ? 'SENT' : 'FAILED',
        gatewayResponse: result.rawResponse || result.error || null,
        sentAt: result.success ? new Date() : null,
      });
    }
  }

  async sendTestSms(dto: { phoneNumber: string; message?: string; gatewayUrl?: string; apiKey?: string }) {
    const settings = await this.getActiveSettings();
    const provider = settings.smsProvider === 'http' ? this.httpProvider : this.mockProvider;

    const testMessage = dto.message || `MOA SMS Test: On-premise SMS gateway connectivity verified successfully at ${new Date().toLocaleTimeString()}!`;

    const result = await provider.sendSms({
      recipientNumber: dto.phoneNumber,
      recipientName: 'Test Recipient',
      message: testMessage,
      senderId: settings.smsSenderId,
      gatewayUrl: dto.gatewayUrl || settings.smsGatewayUrl,
      apiKey: dto.apiKey || settings.smsGatewayKey,
    });

    return {
      provider: provider.name,
      ...result,
    };
  }

  async getLogs(limit = 100) {
    return this.db.query.smsAlerts.findMany({
      orderBy: [desc(schema.smsAlerts.createdAt)],
      limit,
      with: {
        payment: true,
      },
    });
  }

  async retryAlert(alertId: string) {
    const alert = await this.db.query.smsAlerts.findFirst({
      where: eq(schema.smsAlerts.id, alertId),
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    const settings = await this.getActiveSettings();
    const provider = settings.smsProvider === 'http' ? this.httpProvider : this.mockProvider;

    const result = await provider.sendSms({
      recipientNumber: alert.recipientNumber,
      recipientName: alert.recipientName,
      message: alert.message,
      senderId: settings.smsSenderId,
      gatewayUrl: settings.smsGatewayUrl,
      apiKey: settings.smsGatewayKey,
    });

    await this.db
      .update(schema.smsAlerts)
      .set({
        status: result.success ? 'SENT' : 'FAILED',
        gatewayResponse: result.rawResponse || result.error || null,
        sentAt: result.success ? new Date() : null,
        retryCount: alert.retryCount + 1,
      })
      .where(eq(schema.smsAlerts.id, alertId));

    return result;
  }
}

