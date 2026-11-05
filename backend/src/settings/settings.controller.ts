import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateRecipientDto, UpdateRecipientDto } from './dto/recipient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }

  @Get('recipients')
  getRecipients() {
    return this.settingsService.getRecipients();
  }

  @Post('recipients')
  createRecipient(@Body() dto: CreateRecipientDto) {
    return this.settingsService.createRecipient(dto);
  }

  @Put('recipients/:id')
  updateRecipient(@Param('id') id: string, @Body() dto: UpdateRecipientDto) {
    return this.settingsService.updateRecipient(id, dto);
  }

  @Delete('recipients/:id')
  deleteRecipient(@Param('id') id: string) {
    return this.settingsService.deleteRecipient(id);
  }
}

