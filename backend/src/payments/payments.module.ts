import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SmsModule } from '../sms/sms.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SmsModule, SettingsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

