export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    url: process.env.DATABASE_URL || 'postgresql://moa_user:moa_password@localhost:5432/moa_sms_db',
  },
  jwt: {
    secret: process.env.APP_SECRET || 'moa_super_secret_jwt_key_change_in_production_2026',
    expiresIn: '1d',
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'mock',
    gatewayUrl: process.env.SMS_GATEWAY_URL || 'http://10.10.20.50:8080/api/sms/send',
    gatewayApiKey: process.env.SMS_GATEWAY_API_KEY || '',
    senderId: process.env.SMS_GATEWAY_SENDER_ID || 'MOA-FINANCE',
  },
  defaultThreshold: parseFloat(process.env.DEFAULT_THRESHOLD) || 20000000,
});

