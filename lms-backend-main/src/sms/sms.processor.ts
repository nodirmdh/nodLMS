import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { format } from 'date-fns';
import { generateTransmitAccessToken } from '../shared/utils/md5-generator';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';
import {
  SmsAuthJob,
  SmsBulkJob,
  SmsPaymentJob,
  SmsSingleJob,
} from './sms.jobs';

const SMS_BASE = 'https://routee.sayqal.uz/sms';

/**
 * BullMQ worker для очереди `sms`. Это единственное место, где мы
 * собственно ходим во внешний шлюз. Синхронные методы SMSService
 * остаются (пока не все вызывающие перевелись на enqueue), но новые
 * продюсеры должны использовать очередь.
 *
 * Concurrency намеренно скромная (3) — внешний провайдер не любит
 * параллельного выстрела из одного username.
 */
@Processor(QUEUE_NAMES.SMS, { concurrency: 3 })
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger('SmsProcessor');

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case JOB_NAMES.SMS.SEND:
        return this.handleSingle(job.data as SmsSingleJob | SmsAuthJob);
      case JOB_NAMES.SMS.SEND_BULK:
        return this.handleBulk(job.data as SmsBulkJob);
      case 'sms.auth':
        return this.handleAuth(job.data as SmsAuthJob);
      case 'sms.payment':
        return this.handlePayment(job.data as SmsPaymentJob);
      default:
        throw new Error(`Unknown sms job: ${job.name}`);
    }
  }

  // ---------- handlers ----------

  private async handleAuth(data: SmsAuthJob): Promise<unknown> {
    const text = `RUSTAMBEK.lmsnet.uz saytina kiriw ushin kodi-${data.code}`;
    return this.transmit({ phone: data.phone, text });
  }

  private async handleSingle(data: SmsSingleJob | SmsAuthJob): Promise<unknown> {
    if ('code' in data) {
      return this.handleAuth(data);
    }
    return this.transmit(data);
  }

  private async handleBulk(data: SmsBulkJob): Promise<unknown> {
    if (!data.messages?.length) return { sent: 0 };
    return this.multicast(data.messages);
  }

  private async handlePayment(data: SmsPaymentJob): Promise<unknown> {
    const formattedDate = format(new Date(data.date), 'dd.MM.yyyy');
    const amountPretty = data.amount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const fio = (data.fio ?? '').replace('\t', ' ').toUpperCase();

    const messages = [] as SmsBulkJob['messages'];
    const template = (phone: string) => ({
      smsid: Math.floor(Math.random() * (2000 - 100 + 1)) + 100,
      phone,
      text: `Assalawma A'leykum hu'rmetli ata-ana! Perzentin'iz ${fio} ${formattedDate} sa'nesinde ${amountPretty} swm mug'darinda to'lem qabillandi! To'lem ushin raxmet! - hu'rmet penen RUSTAMBEK OQIW ORAYI Administratciya. tel: 941235151`,
    });

    if (data.fatherPhone) messages.push(template(data.fatherPhone));
    if (data.montherPhone) messages.push(template(data.montherPhone));

    if (!messages.length) return { sent: 0 };
    return this.multicast(messages);
  }

  // ---------- transports ----------

  private async transmit(msg: SmsSingleJob): Promise<unknown> {
    if (!this.hasCredentials()) {
      this.logger.warn('SMS credentials missing — dry-run');
      return { dryRun: true, ...msg };
    }

    const { utime, hash } = generateTransmitAccessToken('TransmitSMS');

    const body = {
      utime,
      username: process.env.SMS_USERNAME,
      service: { service: 2 },
      message: {
        smsid: msg.smsid ?? Math.floor(Math.random() * 1_000_000),
        phone: msg.phone,
        text: msg.text,
      },
    };

    return this.postJson(`${SMS_BASE}/TransmitSMS`, hash, body);
  }

  private async multicast(messages: SmsBulkJob['messages']): Promise<unknown> {
    if (!this.hasCredentials()) {
      this.logger.warn(
        `SMS credentials missing — dry-run (bulk ${messages.length})`,
      );
      return { dryRun: true, count: messages.length };
    }

    const { utime, hash } = generateTransmitAccessToken('MulticastSMS');

    const body = {
      utime,
      username: process.env.SMS_USERNAME,
      service: { service: 4 },
      settings: { textsource: 'text' },
      messages,
    };

    return this.postText(`${SMS_BASE}/MulticastSMS`, hash, body);
  }

  // ---------- http helpers ----------

  private async postJson(
    url: string,
    token: string,
    body: unknown,
  ): Promise<unknown> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      redirect: 'follow',
    });
    if (!res.ok) {
      throw new Error(`SMS gateway ${res.status}`);
    }
    return res.json();
  }

  private async postText(
    url: string,
    token: string,
    body: unknown,
  ): Promise<string> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      redirect: 'follow',
    });
    if (!res.ok) {
      throw new Error(`SMS gateway ${res.status}`);
    }
    return res.text();
  }

  private hasCredentials(): boolean {
    return !!(process.env.SMS_USERNAME && process.env.SMS_SECRET_KEY);
  }
}
