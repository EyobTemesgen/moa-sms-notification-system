export interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export interface Payment {
  id: string;
  voucherRef: string;
  payeeName: string;
  amount: string;
  category: string;
  paymentMethod: string;
  paymentDate: string;
  notes?: string;
  requiresAlert: boolean;
  createdAt: string;
  createdBy?: User;
  alerts?: SmsAlert[];
}

export interface SmsAlert {
  id: string;
  paymentId: string;
  recipientName: string;
  recipientNumber: string;
  message: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  gatewayResponse?: string;
  sentAt?: string;
  retryCount: number;
  createdAt: string;
  payment?: Payment;
}

export interface Recipient {
  id: string;
  name: string;
  title: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface SystemSettings {
  id: string;
  thresholdAmount: string;
  isAlertEnabled: boolean;
  smsProvider: 'mock' | 'http';
  smsGatewayUrl?: string;
  smsGatewayKey?: string;
  smsSenderId: string;
}

export interface Stats {
  totalPayments: number;
  totalAmount: number;
  highValueCount: number;
  highValueAmount: number;
  currentThreshold: number;
  totalAlerts: number;
  sentAlerts: number;
  failedAlerts: number;
}
