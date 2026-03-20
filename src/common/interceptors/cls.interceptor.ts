import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ClsService } from "nestjs-cls";

@Injectable()
export class ClsInterceptor implements NestInterceptor {
    constructor(private readonly cls: ClsService) { }

    intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest();

        // JwtStrategy devolve `userId`; outros fluxos podem usar `id` (Passport comum).
        const userId = req.user?.id ?? req.user?.userId;
        if (userId != null) {
            this.cls.set('userId', userId);
        }

        return next.handle();
    }
}