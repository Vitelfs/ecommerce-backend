import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtGuard } from './guards/jwt.guard';
import { CurrentUserDto } from './dto/current-user.dto';
import { CurrentUser } from './decorators/get-user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() data: LoginDto) {
    return await this.authService.login(data);
  }

  @Post('refresh')
  async refresh(@Body() data: RefreshTokenDto) {
    return await this.authService.refresh(data);
  }

  @Post('logout')
  async logout(@Body() data: RefreshTokenDto) {
    return await this.authService.logout(data.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getCurrentUser(@CurrentUser() currentUser: CurrentUserDto) {
    return await this.authService.getCurrentUser(currentUser.id);
  }
}
