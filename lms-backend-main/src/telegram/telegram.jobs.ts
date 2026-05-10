/**
 * Типизированные payload'ы telegram-очереди. Бизнес-логики пока нет —
 * процессор просто логирует и возвращает `{ skipped: true }`, пока
 * TELEGRAM_BOT_TOKEN не задан и TelegramProvider не реализован.
 */

export interface TelegramSendMessageJob {
  chatId: string | number;
  text: string;
  parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  disablePreview?: boolean;
}

export interface TelegramSendDocumentJob {
  chatId: string | number;
  caption?: string;
  /** URL или base64 файла. Реализация появится вместе с провайдером. */
  fileRef: string;
}
