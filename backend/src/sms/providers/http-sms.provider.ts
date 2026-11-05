import { Injectable, Logger } from '@nestjs/common';
import { SmsProvider, SmsSendOptions, SmsSendResult } from '../interfaces/sms-provider.interface';

@Injectable()
export class HttpSmsProvider implements SmsProvider {
  name = 'HTTP_ON_PREMISE_PROVIDER';
  private readonly logger = new Logger('HttpSmsGateway');

  async sendSms(options: SmsSendOptions): Promise<SmsSendResult> {
    const url = options.gatewayUrl || process.env.SMS_GATEWAY_URL;
    if (!url) {
      return {
        success: false,
        error: 'No SMS Gateway URL configured. Please configure in settings or .env.',
      };
    }

    try {
      this.logger.log(`Dispatching SMS to ${options.recipientNumber} via gateway: ${url}`);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const apiKey = options.apiKey || process.env.SMS_GATEWAY_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['X-API-KEY'] = apiKey;
      }

      const payload = {
        to: options.recipientNumber,
        message: options.message,
        sender: options.senderId || 'MOA-FINANCE',
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch {
        parsedResponse = responseText;
      }

      if (!response.ok) {
        this.logger.error(`SMS Gateway returned error ${response.status}: ${responseText}`);
        return {
          success: false,
          error: `Gateway error HTTP ${response.status}: ${responseText.substring(0, 200)}`,
          rawResponse: responseText,
        };
      }

      this.logger.log(`SMS successfully accepted by gateway for ${options.recipientNumber}`);
      return {
        success: true,
        messageId: parsedResponse?.messageId || parsedResponse?.id || `HTTP-${Date.now()}`,
        rawResponse: responseText,
      };
    } catch (err: any) {
      this.logger.error(`Failed to reach SMS gateway at ${url}: ${err.message}`);
      return {
        success: false,
        error: `Failed to connect to gateway: ${err.message}`,
      };
    }
  }
}

