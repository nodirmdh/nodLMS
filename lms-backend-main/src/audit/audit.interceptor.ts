import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { AUDIT_METADATA, AuditMeta } from './audit.decorator';

/**
 * Auto-audit через декоратор `@Audit({ action, entity })` на контроллере.
 *
 * В этой foundation-итерации interceptor:
 *   - извлекает userId, ip, userAgent из запроса;
 *   - резолвит entityId по правилу `entityIdFrom` (или `params.id`);
 *   - пишет `action` + `entity` только при успешном ответе;
 *   - не блокирует ответ — запись в AuditLog идёт fire-and-forget.
 *
 * Полноценный diff-capture (before/after) появится позже, когда контроллеры
 * переедут на DTO и у нас будет единая форма update-payload.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditInterceptor');

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<AuditMeta | undefined>(
      AUDIT_METADATA,
      context.getHandler(),
    );
    if (!meta) return next.handle();

    const req = context.switchToHttp().getRequest<
      Request & { user?: { id?: number } }
    >();

    return next.handle().pipe(
      tap((result) => {
        const entityId = this.resolveEntityId(meta, req, result);
        this.auditService
          .record({
            userId: req.user?.id ?? null,
            action: meta.action,
            entity: meta.entity,
            entityId: entityId ?? null,
            ip: (req.ip as string) ?? null,
            userAgent: (req.headers['user-agent'] as string) ?? null,
            diff: this.safeDiff(req) as unknown as Prisma.InputJsonValue,
          })
          .catch(() => void 0);
      }),
    );
  }

  private resolveEntityId(
    meta: AuditMeta,
    req: Request,
    result: unknown,
  ): string | number | null {
    const source = meta.entityIdFrom ?? 'params.id';
    switch (source) {
      case 'params.id':
        return (req.params as Record<string, string>)?.id ?? null;
      case 'body.id':
        return (req.body as Record<string, unknown>)?.id as
          | string
          | number
          | null;
      case 'result.id':
        return (result as Record<string, unknown>)?.id as
          | string
          | number
          | null;
      default:
        return null;
    }
  }

  /**
   * Для дева пишем body запроса (без `password`/`code`/`token`). В prod
   * имеет смысл ограничить, но пока нам важнее отслеживать «кто менял что».
   */
  private safeDiff(req: Request): Record<string, unknown> | null {
    if (!req.body || typeof req.body !== 'object') return null;
    const SENSITIVE = new Set([
      'password',
      'code',
      'token',
      'refreshToken',
      'accessToken',
    ]);
    const clone: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(req.body as Record<string, unknown>)) {
      clone[key] = SENSITIVE.has(key) ? '***' : value;
    }
    return { body: clone };
  }
}
