import { Injectable, Logger } from '@nestjs/common';
import { SmsProvider, SmsSendOptions, SmsSendResult } from '../interfaces/sms-provider.interface';

@Injectable()
export class MockSmsProvider implements SmsProvider {
  name = 'MOCK_PROVIDER';
  private readonly logger = new Logger('MockSmsGateway');

  async sendSms(options: SmsSendOptions): Promise<SmsSendResult> {
    const messageId = `MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    this.logger.log('====================================================');
    this.logger.log(`[SMS DISPATCHED (MOCK)] To: ${options.recipientNumber} (${options.recipientName || 'Manager'})`);
    this.logger.log(`[SMS SENDER] ${options.senderId || 'MOA-FINANCE'}`);
    this.logger.log(`[SMS MESSAGE]:\n"${options.message}"`);
    this.logger.log(`[SMS ID]: ${messageId}`);
    this.logger.log('====================================================');

    return {
      success: true,
      messageId,
      rawResponse: JSON.stringify({
        status: 'OK',
        simulated: true,
        messageId,
        recipient: options.recipientNumber,
        timestamp: new Date().toISOString(),
      }),
    };
  }
}

