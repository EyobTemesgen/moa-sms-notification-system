export interface SmsSendOptions {
  recipientNumber: string;
  recipientName?: string;
  message: string;
  senderId?: string;
  gatewayUrl?: string;
  apiKey?: string;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  rawResponse?: string;
  error?: string;
}

export interface SmsProvider {
  name: string;
  sendSms(options: SmsSendOptions): Promise<SmsSendResult>;
}

