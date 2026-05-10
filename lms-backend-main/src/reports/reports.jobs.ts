/**
 * Типы job'ов очереди `reports`.
 *
 * Первая реализация: экспорт транзакций в Excel. Результат worker пишет
 * обратно в Redis по ключу `report:result:<jobId>` (TTL 1 час). Frontend
 * либо polls `/admin/reports/:jobId`, либо SSE/websocket позже.
 */

export type ReportKind =
  | 'transactions.excel'
  | 'students.excel'
  | 'debtors.excel';

export interface GenerateReportJob {
  kind: ReportKind;
  /** Период отчёта. Формат: 'dd.MM.yyyy' (совместим с TransactionsService). */
  from?: string;
  to?: string;
  /** Фильтры — опциональные, зависит от kind. */
  filter?: Record<string, unknown>;
  /** Для журнала: кто заказал. */
  requestedBy?: number | null;
  branchId?: number | null;
}

export interface ReportResult {
  kind: ReportKind;
  /** base64 содержимого файла. Держим в Redis 1 час. */
  base64: string;
  filename: string;
  mime: string;
  generatedAt: string;
  rowCount: number;
}
