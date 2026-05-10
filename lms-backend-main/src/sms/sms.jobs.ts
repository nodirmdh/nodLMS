/**
 * Типизированные payload'ы для sms-очереди.
 *
 * Бизнес-логика отправки живёт в `SmsProcessor` (worker). Любой продюсер
 * импортирует этот файл, а не sms.service напрямую — чтобы не тянуть
 * внешние HTTP-вызовы в api-процесс.
 */

export interface SmsAuthJob {
  phone: string;
  /**
   * OTP код уже сохранён OtpService'ом. Worker просто подставляет его в
   * шаблон. Передаём явно, чтобы worker не зависел от Redis-клиента.
   */
  code: string;
}

export interface SmsSingleJob {
  phone: string;
  text: string;
  smsid?: number | string;
}

export interface SmsBulkJob {
  messages: Array<{ phone: string; text: string; smsid?: number | string }>;
}

export interface SmsPaymentJob {
  fio: string;
  date: string | Date;
  amount: number;
  fatherPhone?: string | null;
  montherPhone?: string | null;
}
