import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE } from '../database/drizzle.provider';
import * as schema from '../database/schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateRecipientDto, UpdateRecipientDto } from './dto/recipient.dto';

@Injectable()
export class SettingsService {
  constructor(@Inject(DRIZZLE) private db: any) {}

  async getSettings() {
    let settings = await this.db.query.systemSettings.findFirst();
    if (!settings) {
      const [newSettings] = await this.db
        .insert(schema.systemSettings)
        .values({
          thresholdAmount: '20000000.00',
          isAlertEnabled: true,
          smsProvider: 'mock',
          smsSenderId: 'MOA-FINANCE',
        })
        .returning();
      settings = newSettings;
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const current = await this.getSettings();
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.thresholdAmount !== undefined) {
      updateData.thresholdAmount = dto.thresholdAmount.toString();
    }
    if (dto.isAlertEnabled !== undefined) {
      updateData.isAlertEnabled = dto.isAlertEnabled;
    }
    if (dto.smsProvider !== undefined) {
      updateData.smsProvider = dto.smsProvider;
    }
    if (dto.smsGatewayUrl !== undefined) {
      updateData.smsGatewayUrl = dto.smsGatewayUrl;
    }
    if (dto.smsGatewayKey !== undefined) {
      updateData.smsGatewayKey = dto.smsGatewayKey;
    }
    if (dto.smsSenderId !== undefined) {
      updateData.smsSenderId = dto.smsSenderId;
    }

    const [updated] = await this.db
      .update(schema.systemSettings)
      .set(updateData)
      .where(eq(schema.systemSettings.id, current.id))
      .returning();

    return updated;
  }

  // Recipients
  async getRecipients() {
    return this.db.query.alertRecipients.findMany({
      orderBy: [desc(schema.alertRecipients.createdAt)],
    });
  }

  async createRecipient(dto: CreateRecipientDto) {
    const [recipient] = await this.db
      .insert(schema.alertRecipients)
      .values({
        name: dto.name,
        title: dto.title,
        phoneNumber: dto.phoneNumber,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      })
      .returning();
    return recipient;
  }

  async updateRecipient(id: string, dto: UpdateRecipientDto) {
    const recipient = await this.db.query.alertRecipients.findFirst({
      where: eq(schema.alertRecipients.id, id),
    });
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    const [updated] = await this.db
      .update(schema.alertRecipients)
      .set(dto)
      .where(eq(schema.alertRecipients.id, id))
      .returning();
    return updated;
  }

  async deleteRecipient(id: string) {
    await this.db.delete(schema.alertRecipients).where(eq(schema.alertRecipients.id, id));
    return { success: true };
  }
}

