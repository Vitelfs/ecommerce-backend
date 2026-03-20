import { Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { HashingServiceProtocol } from './hashing.service';

@Module({
    providers: [{
        provide: HashingServiceProtocol,
        useClass: BcryptService
    }],
    exports: [HashingServiceProtocol]
})
export class HashModule { }
