import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashingServiceProtocol } from './hash/hashing.service';
import { InjectRepository } from '@nestjs/typeorm';

import { RefreshToken } from './entities/refresh-token.entity';
import { Repository, MoreThan } from 'typeorm';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger("AuthService");
    constructor(
        private readonly jwtService: JwtService,
        private readonly bcryptService: HashingServiceProtocol,
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>
    ) { }

    async verifyUser(password: string, hashedPassword: string): Promise<boolean> {
        const isValid = await this.bcryptService.compare(password, hashedPassword);
        if (isValid) {
            return true;
        }
        throw new UnauthorizedException('Acesso não autorizado');
    }

    private async generateRefreshToken(userId: string): Promise<string> {
        const token = randomBytes(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

        await this.refreshTokenRepository.save({
            token,
            userId,
            expiresAt,
        });

        return token;
    }

    async login(login: LoginDto) {
        const user = await this.userRepository.findOne({
            where: { email: login.email },
            select: ['id', 'first_name', 'second_name', 'email', 'password', 'avatar', 'role'],
        });

        if (user === null) {
            this.logger.warn("Usuário não encontrado.")
            throw new NotFoundException('Usuário não encontrado');
        }

        await this.verifyUser(login.password, user.password);

        const payload = {
            username: `${user.first_name} ${user.second_name}`,
            sub: user.id,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = await this.generateRefreshToken(user.id);

        return {
            accessToken,
            refreshToken,
        };
    }

    async refresh(refreshTokenDto: RefreshTokenDto) {
        const refreshToken = await this.refreshTokenRepository.findOne({
            where: {
                token: refreshTokenDto.refreshToken,
                expiresAt: MoreThan(new Date()),
            },
            relations: ['user'],
        });

        if (!refreshToken) {
            this.logger.warn("Refresh token inválido ou expirado");
            throw new UnauthorizedException('Refresh token inválido ou expirado');
        }

        const user = await this.userRepository.findOne({
            where: { id: refreshToken.userId },
            select: ['id', 'first_name', 'second_name', 'email', 'password', 'avatar', 'role'],
        });

        if (!user) {
            this.logger.warn("Usuário não encontrado para refresh token");
            throw new NotFoundException('Usuário não encontrado');
        }

        const payload = {
            username: `${user.first_name} ${user.second_name}`,
            sub: user.id,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
        };
    }

    async logout(refreshToken: string) {
        await this.refreshTokenRepository.delete({ token: refreshToken });
        return { message: 'Logout realizado com sucesso' };
    }

    async getCurrentUser(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'first_name', 'second_name', 'email', 'password', 'avatar', 'role'],
        });

        if (!user) {
            this.logger.warn("Usuário não encontrado");
            throw new NotFoundException('Usuário não encontrado');
        }

        return user;
    }

    /**
     * Invalida todos os refresh tokens de um usuário.
     * Usado quando a senha é alterada para forçar logout em todos os dispositivos.
     */
    async invalidateUserRefreshTokens(userId: string): Promise<void> {
        try {
            const result = await this.refreshTokenRepository.delete({ userId });
            this.logger.log(`Tokens de refresh invalidados para o usuário ${userId}. ${result.affected || 0} token(s) removido(s).`);
        } catch (error) {
            this.logger.error(`Erro ao invalidar refresh tokens do usuário ${userId}:`, error);
            // Não lança exceção para não quebrar o fluxo de alteração de senha
        }
    }
}
