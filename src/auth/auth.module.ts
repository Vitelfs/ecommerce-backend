import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { JwtGuard } from './guards/jwt.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HashModule } from './hash/hash.module';
import { PassportModule } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [AuthService, JwtStrategy, RolesGuard, JwtGuard],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15min' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    HashModule,
    TypeOrmModule.forFeature([User, RefreshToken])
  ],
  controllers: [AuthController],
  exports: [JwtModule, RolesGuard, JwtGuard, AuthService],
})
export class AuthModule { }
