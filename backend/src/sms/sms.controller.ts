import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { SmsService } from './sms.service';
import { TestSmsDto } from './dto/test-sms.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('test')
  async testSms(@Body() testDto: TestSmsDto) {
    return this.smsService.sendTestSms(testDto);
  }

  @Get('logs')
  async getLogs() {
    return this.smsService.getLogs();
  }

  @Post('retry/:id')
  async retry(@Param('id') id: string) {
    return this.smsService.retryAlert(id);
  }
}

