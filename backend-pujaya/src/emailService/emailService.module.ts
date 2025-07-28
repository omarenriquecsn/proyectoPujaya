import { Module } from '@nestjs/common';
import { EmailService } from './emailService.service';

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}