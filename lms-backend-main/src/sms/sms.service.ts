import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { format } from 'date-fns';
import Redis from 'ioredis';
import { generateTransmitAccessToken } from 'src/shared/utils/md5-generator';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { JOB_NAMES, QUEUE_NAMES } from '../queues/queue.constants';
import { SmsBulkJob, SmsPaymentJob, SmsSingleJob } from './sms.jobs';

const SMS_BASE = 'https://routee.sayqal.uz/sms';

/**
 * SMSService отвечает только за «как это доставить» и даёт два пути:
 *   - enqueue*  — положить задачу в BullMQ (`sms` queue). Рекомендуемый способ.
 *   - sync send* — прежние методы, вызывают gateway сразу. Оставлены
 *     только ради совместимости с LessonsService/TransactionsService,
 *     которые пока не переехали на очередь.
 *
 * Новая бизнес-логика должна ходить через enqueue.
 */
@Injectable()
export class SMSService {
  private readonly logger = new Logger('SMSService');

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectQueue(QUEUE_NAMES.SMS) private readonly smsQueue: Queue,
  ) {}

  // ==============================================================
  // Async path — through BullMQ
  // ==============================================================

  async enqueueAuthSms(phone: string, code: string) {
    return this.smsQueue.add(
      'sms.auth',
      { phone, code },
      {
        jobId: `auth:${phone}:${Date.now()}`,
      },
    );
  }

  async enqueueSingle(msg: SmsSingleJob) {
    return this.smsQueue.add(JOB_NAMES.SMS.SEND, msg);
  }

  async enqueueBulk(messages: SmsBulkJob['messages']) {
    if (!messages.length) return null;
    return this.smsQueue.add(JOB_NAMES.SMS.SEND_BULK, { messages });
  }

  async enqueuePayment(data: SmsPaymentJob) {
    return this.smsQueue.add('sms.payment', data);
  }

  // ==============================================================
  // Legacy synchronous path — still used by some services. These
  // methods call the gateway in-process. New code should prefer
  // the enqueue* variants above.
  // ==============================================================

  async sendAuthSMS(phone: string): Promise<any> {
    const { utime, hash } = generateTransmitAccessToken('TransmitSMS');
    // OTP moved to OtpService (Redis-backed). `AuthService.login` stores
    // the code under `otp:<phone>` — we read it here for the SMS text.
    let otp: string | null = null;
    try {
      otp = await this.redis.get(`otp:${phone}`);
    } catch {
      otp = null;
    }
    const body = {
      utime,
      username: process.env.SMS_USERNAME,
      service: { service: 2 },
      message: {
        smsid: Math.random(),
        phone,
        text: `RUSTAMBEK.lmsnet.uz saytina kiriw ushin kodi-${otp ?? ''}`,
      },
    };

    return this.postJson(`${SMS_BASE}/TransmitSMS`, hash, body);
  }

  async sendLessonGroupSMS(students: SmsBulkJob['messages']): Promise<string> {
    const { utime, hash } = generateTransmitAccessToken('MulticastSMS');
    const body = {
      utime,
      username: process.env.SMS_USERNAME,
      service: { service: 4 },
      settings: { textsource: 'text' },
      messages: students,
    };
    return this.postText(`${SMS_BASE}/MulticastSMS`, hash, body);
  }

  async sendDebtors(students: SmsBulkJob['messages']): Promise<any> {
    return this.sendLessonGroupSMS(students);
  }

  async sendPayment(payment: {
    fio: string;
    date: string | Date;
    amount: number;
    fatherPhone?: string | null;
    montherPhone?: string | null;
  }): Promise<any> {
    const { utime, hash } = generateTransmitAccessToken('MulticastSMS');
    const formattedDate = format(new Date(payment.date), 'dd.MM.yyyy');
    const amountPretty = payment.amount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const fio = (payment.fio ?? '').replace('\t', ' ').toUpperCase();

    const messages = [] as SmsBulkJob['messages'];
    const mkMsg = (phone: string) => ({
      smsid: Math.floor(Math.random() * (2000 - 100 + 1)) + 100,
      phone,
      text: `Assalawma A'leykum hu'rmetli ata-ana! Perzentin'iz ${fio} ${formattedDate} sa'nesinde ${amountPretty} swm mug'darinda to'lem qabillandi! To'lem ushin raxmet! - hu'rmet penen RUSTAMBEK OQIW ORAYI Administratciya. tel: 941235151`,
    });
    if (payment.fatherPhone) messages.push(mkMsg(payment.fatherPhone));
    if (payment.montherPhone) messages.push(mkMsg(payment.montherPhone));
    if (!messages.length) return;

    const body = {
      utime,
      username: process.env.SMS_USERNAME,
      service: { service: 4 },
      settings: { textsource: 'text' },
      messages,
    };
    try {
      return await this.postText(`${SMS_BASE}/MulticastSMS`, hash, body);
    } catch (err) {
      this.logger.warn(
        `sendPayment failed: ${err instanceof Error ? err.message : err}`,
      );
      return;
    }
  }

  // ==============================================================
  // http helpers
  // ==============================================================

  private hasCredentials() {
    return !!(process.env.SMS_USERNAME && process.env.SMS_SECRET_KEY);
  }

  private async postJson(url: string, token: string, body: unknown) {
    if (!this.hasCredentials()) {
      this.logger.warn('SMS credentials missing — dry-run');
      return { dryRun: true };
    }
    try {
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
    } catch (error) {
      throw new ServiceUnavailableException({
        error: 'SMS service not avialable',
      });
    }
  }

  private async postText(url: string, token: string, body: unknown) {
    if (!this.hasCredentials()) {
      this.logger.warn('SMS credentials missing — dry-run');
      return '';
    }
    try {
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
    } catch (error) {
      throw new ServiceUnavailableException({
        error: 'SMS service not avialable',
      });
    }
  }
}
