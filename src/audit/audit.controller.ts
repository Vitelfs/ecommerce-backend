import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) { }

  @Post()
  create(@Body() createLogDto: CreateAuditDto) {
    return this.auditService.create(createLogDto);
  }

  @Get()
  findAll() {
    return this.auditService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogDto: UpdateAuditDto) {
    return this.auditService.update(+id, updateLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditService.remove(+id);
  }
}
