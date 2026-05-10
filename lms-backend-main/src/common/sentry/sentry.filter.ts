import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/node';

/**
 * Глобальный exception filter с интеграцией Sentry.
 *
 * Повторяет поведение прежнего `AllExceptionsFilter` (формат ответа,
 * маппинг Prisma кодов), но дополнительно шлёт ошибку в Sentry, если
 * статус >= 500 или это нестандартный Error. 4xx HttpException'ы не
 * шлём — это нормальные ошибки клиента.
 */
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: { id?: number } }>();

    const isProd = process.env.NODE_ENV === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const r = res as Record<string, unknown>;
        message = (r.message as string | string[]) ?? exception.message;
        errorName = (r.error as string) ?? exception.name;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Unique constraint violation';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = isProd ? 'Database error' : exception.message;
      }
      errorName = 'PrismaError';
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = isProd ? 'Invalid query' : exception.message;
      errorName = 'PrismaValidationError';
    } else if (exception instanceof Error) {
      message = isProd ? 'Internal server error' : exception.message;
      errorName = exception.name;
    }

    // Send to Sentry for 5xx or unknown errors.
    if (status >= 500 && exception instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('http.method', request.method);
        scope.setTag('http.status', String(status));
        scope.setContext('request', {
          url: request.url,
          method: request.method,
          userAgent: request.headers['user-agent'],
          ip: request.ip,
        });
        if (request.user?.id != null) {
          scope.setUser({ id: String(request.user.id) });
        }
        Sentry.captureException(exception);
      });
    }

    this.logger.error(
      `${request.method} ${request.url} -> ${status} ${
        errorName ?? ''
      } ${Array.isArray(message) ? message.join('; ') : message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorName,
      message,
    });
  }
}
