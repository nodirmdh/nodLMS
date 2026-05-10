import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEntry {
  userId?: number | null;
  action: string;
  entity: string;
  entityId?: string | number | null;
  diff?: Prisma.InputJsonValue | null;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Тонкая обёртка над `prisma.auditLog.create`. Никогда не кидает —
 * падение аудита не должно валить основной запрос.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger('AuditService');

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId ?? null,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId != null ? String(entry.entityId) : null,
          diff: entry.diff ?? Prisma.DbNull,
          ip: entry.ip ?? null,
          userAgent: entry.userAgent ?? null,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`audit write failed: ${message}`);
    }
  }
}
