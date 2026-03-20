import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

@Injectable()
export class WsJwtGuard implements CanActivate {
    private readonly logger = new Logger(WsJwtGuard.name)

    constructor(private readonly jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient<Socket>()

        try {
            const token = this.extractToken(client)
            if (!token) {
                throw new WsException('Token não fornecido')
            }

            const payload = this.jwtService.verify(token)
            client.data.user = {
                userId: payload.sub,
                username: payload.username,
                role: payload.role,
            }

            return true
        } catch (error) {
            this.logger.warn(`WebSocket auth falhou: ${error.message}`)
            throw new WsException('Token inválido')
        }
    }

    private extractToken(client: Socket): string | null {
        const authToken = client.handshake.auth?.token as string | undefined
        if (authToken) return authToken

        const authHeader = client.handshake.headers?.authorization
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.slice(7)
        }

        return null
    }

    static verifyClient(client: Socket, jwtService: JwtService): boolean {
        try {
            const authToken = client.handshake.auth?.token as string | undefined
            let token = authToken

            if (!token) {
                const authHeader = client.handshake.headers?.authorization
                if (authHeader?.startsWith('Bearer ')) {
                    token = authHeader.slice(7)
                }
            }

            if (!token) return false

            const payload = jwtService.verify(token)
            client.data.user = {
                userId: payload.sub,
                username: payload.username,
                role: payload.role,
            }

            return true
        } catch {
            return false
        }
    }
}
