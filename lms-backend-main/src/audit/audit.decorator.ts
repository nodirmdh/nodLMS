import { SetMetadata } from '@nestjs/common';

export const AUDIT_METADATA = 'audit:metadata';

export interface AuditMeta {
  /** Короткая машинная строка, например `student.update`. */
  action: string;
  /** Имя сущности, `"Student" | "Transaction" | ...`. */
  entity: string;
  /**
   * Опционально: какой параметр запроса содержит id сущности. Если не
   * задан — AuditInterceptor попытается взять `req.params.id`.
   */
  entityIdFrom?: 'params.id' | 'body.id' | 'result.id';
}

/**
 * Пометить обработчик как audit-target. Interceptor запишет вызов в
 * `AuditLog` (userId, action, entity, entityId, ip, userAgent).
 *
 * Пример:
 *   @Audit({ action: 'student.update', entity: 'Student' })
 *   @Patch('/:id')
 *   update(...) {}
 */
export const Audit = (meta: AuditMeta) => SetMetadata(AUDIT_METADATA, meta);
