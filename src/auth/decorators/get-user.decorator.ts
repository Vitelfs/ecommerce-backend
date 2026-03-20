import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { User } from "src/users/entities/user.entity";

export const CurrentUser = createParamDecorator((data: keyof User | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    if (data) {
        if (request.user)
            return request.user[data];
    }
    return request.user;
});