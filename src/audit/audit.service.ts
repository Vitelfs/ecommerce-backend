import { Injectable } from '@nestjs/common';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';

@Injectable()
export class AuditService {
  create(createAuditDto: CreateAuditDto) {
    return 'This action adds a new log';
  }

  findAll() {
    return `This action returns all log`;
  }

  findOne(id: number) {
    return `This action returns a #${id} log`;
  }

  update(id: number, updateAuditDto: UpdateAuditDto) {
    return `This action updates a #${id} log`;
  }

  remove(id: number) {
    return `This action removes a #${id} log`;
  }
}
