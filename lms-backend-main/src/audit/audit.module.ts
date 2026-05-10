import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './audit.interceptor';

/**
 * AuditModule — foundation.
 *
 * Экспортирует `AuditService` (явный `record()` для сервисов) и
 * регистрирует глобальный `AuditInterceptor`. Interceptor пишет в
 * `AuditLog` только те обработчики, которые помечены `@Audit(...)`.
 * Остальные запросы не пишутся — пока что аудит избирательный.
 */
@Global()
@Module({
  providers: [
    AuditService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
