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

/**
 * Global exception filter.
 *
 * - Preserves HTTP status/message for HttpException.
 * - Maps known Prisma errors to sensible HTTP statuses.
 * - In production hides stack traces and internal error details.
 * - Always logs the original error server-side for diagnostics.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

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
      // Map common Prisma codes
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

    // Always log on the server
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
