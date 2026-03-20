import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditSubscriber } from './audit.subscriber';

@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditSubscriber],
})
export class AuditModule { }
