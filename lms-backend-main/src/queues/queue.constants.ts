/**
 * Queue names and well-known job names.
 *
 * Keep this file free of runtime deps so workers and producers can import
 * it without dragging in NestJS modules.
 */

export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  SMS: 'sms',
  TELEGRAM: 'telegram',
  REPORTS: 'reports',
  SCHEDULER: 'scheduler',
  DLQ: 'dlq',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const ALL_QUEUE_NAMES: QueueName[] = [
  QUEUE_NAMES.NOTIFICATIONS,
  QUEUE_NAMES.SMS,
  QUEUE_NAMES.TELEGRAM,
  QUEUE_NAMES.REPORTS,
  QUEUE_NAMES.SCHEDULER,
  QUEUE_NAMES.DLQ,
];

/**
 * Canonical job names per queue. Not enforced at the type level yet — job
 * payloads are `unknown` for the infrastructure phase. Once business logic
 * moves in, each queue should expose typed payloads from its own module.
 */
export const JOB_NAMES = {
  NOTIFICATIONS: {
    SEND: 'notifications.send',
    DISPATCH_SCHEDULED: 'notifications.dispatch-scheduled',
  },
  SMS: {
    SEND: 'sms.send',
    SEND_BULK: 'sms.send-bulk',
  },
  TELEGRAM: {
    SEND_MESSAGE: 'telegram.send-message',
    SEND_DOCUMENT: 'telegram.send-document',
  },
  REPORTS: {
    GENERATE: 'reports.generate',
    EXPORT_EXCEL: 'reports.export-excel',
    EXPORT_PDF: 'reports.export-pdf',
  },
  SCHEDULER: {
    CLOSE_COMPLETED_GROUPS: 'scheduler.close-completed-groups',
    PROCESS_SALARIES: 'scheduler.process-salaries',
  },
} as const;
