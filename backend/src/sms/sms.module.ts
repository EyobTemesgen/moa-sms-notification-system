import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { MockSmsProvider } from './providers/mock-sms.provider';
import { HttpSmsProvider } from './providers/http-sms.provider';

@Module({
  controllers: [SmsController],
  providers: [SmsService, MockSmsProvider, HttpSmsProvider],
  exports: [SmsService],
})
export class SmsModule {}

