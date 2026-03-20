import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('AllExceptionsFilter');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        if (exception instanceof AxiosError) {
            const status =
                exception.response?.status ?? HttpStatus.BAD_GATEWAY;

            const message =
                exception.response?.data?.message ||
                exception.message ||
                'Erro ao comunicar com serviço externo';

            this.logger.error(
                `${request.method} ${request.url} - AXIOS ${status} - ${message}`,
            );

            return response.status(status).json({
                statusCode: status,
                message,
                path: request.url,
                timestamp: new Date().toISOString(),
            });
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            let message: string | string[] = 'Erro';

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null &&
                'message' in exceptionResponse
            ) {
                message = (exceptionResponse as any).message;
            }

            this.logger.warn(
                `${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`,
            );

            return response.status(status).json({
                statusCode: status,
                message,
                path: request.url,
                timestamp: new Date().toISOString(),
            });
        }

        this.logger.error(
            `${request.method} ${request.url} - 500`,
            exception instanceof Error ? exception.stack : undefined,
        );

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: 500,
            message: 'Erro interno',
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}