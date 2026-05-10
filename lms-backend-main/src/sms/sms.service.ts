import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { generateTransmitAccessToken } from 'src/shared/utils/md5-generator';
import { format } from 'date-fns';

@Injectable()
export class SMSService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheStore) {}

  // async getSMSStatus(transactionid: string, smsid: string): Promise<any> {
  //   const { utime, hash } = generateTransmitAccessToken('StatusSMS');
  //   const myHeaders = new Headers();
  //   myHeaders.append('x-access-token', hash);
  //   myHeaders.append('Content-Type', 'application/json');

  //   const raw = JSON.stringify({
  //     utime,
  //     username: process.env.SMS_USERNAME,
  //     transactionid,
  //     smsid,
  //   });

  //   try {
  //     const response = await fetch('https://routee.sayqal.uz/sms/StatusSMS', {
  //       method: 'POST',
  //       headers: myHeaders,
  //       body: raw,
  //       redirect: 'follow',
  //     });
  //     const result = await response.json();

  //     console.log(result);
  //     if (result) {
  //       if(result.status)
  //     } else {
  //       throw new ServiceUnavailableException({
  //         error: 'SMS service not avialable',
  //       });
  //     }
  //   } catch (error) {
  //     throw new ServiceUnavailableException({
  //       error: 'SMS service not avialable',
  //     });
  //   }
  // }

  async sendAuthSMS(phone: string): Promise<any> {
    const { utime, hash } = generateTransmitAccessToken('TransmitSMS');
    const otp = await this.cacheManager.get(`otp:${phone}`);
    const myHeaders = new Headers();
    myHeaders.append('x-access-token', hash);
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      utime,
      username: process.env.SMS_USERNAME,
      service: {
        service: 2,
      },
      message: {
        smsid: Math.random(),
        phone: phone,
        text: `RUSTAMBEK.lmsnet.uz saytina kiriw ushin kodi-${otp}`,
      },
    });

    try {
      const response = await fetch('https://routee.sayqal.uz/sms/TransmitSMS', {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      });
      const result = await response.json();

      if (result) {
        // @ts-ignore
        // await this.getSMSStatus(result.transactionid, result.smsid);

        return result;
      } else {
        throw new ServiceUnavailableException({
          error: 'SMS service not avialable',
        });
      }
    } catch (error) {
      throw new ServiceUnavailableException({
        error: 'SMS service not avialable',
      });
    }
  }

  async sendLessonGroupSMS(students): Promise<string> {
    const { utime, hash } = generateTransmitAccessToken('MulticastSMS');
    const myHeaders = new Headers();
    myHeaders.append('x-access-token', hash);
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      utime,
      username: process.env.SMS_USERNAME,
      service: {
        service: 4,
      },
      settings: {
        textsource: 'text',
      },
      messages: students,
    });

    try {
      const response = await fetch(
        'https://routee.sayqal.uz/sms/MulticastSMS',
        {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow',
        },
      );
      const result = await response.text();
      return result;
    } catch (error) {
      throw new ServiceUnavailableException({
        error: 'SMS service not avialable',
      });
    }
  }

  async sendDebtors(students): Promise<any> {
    const { utime, hash } = generateTransmitAccessToken('MulticastSMS');
    const myHeaders = new Headers();
    myHeaders.append('x-access-token', hash);
    myHeaders.append('Content-Type', 'application/json');
    const raw = JSON.stringify({
      utime,
      username: process.env.SMS_USERNAME,
      service: {
        service: 4,
      },
      settings: {
        textsource: 'text',
      },
      messages: students,
    });
    try {
      const response = await fetch(
        'https://routee.sayqal.uz/sms/MulticastSMS',
        {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow',
        },
      );
      const result = await response.text();
      return result;
    } catch (error) {
      throw new ServiceUnavailableException({
        error: 'SMS service not avialable',
      });
    }
  }

  async sendPayment(payment): Promise<any> {
    const { utime, hash } = generateTransmitAccessToken('MulticastSMS');
    const myHeaders = new Headers();
    myHeaders.append('x-access-token', hash);
    myHeaders.append('Content-Type', 'application/json');
    const date = new Date(payment.date);
    const formattedDate = format(date, 'dd.MM.yyyy');

    let messages = [];

    if (payment.fatherPhone) {
      messages.push({
        smsid: Math.floor(Math.random() * (2000 - 100 + 1)) + 100,
        phone: payment.fatherPhone,
        text: `Assalawma A'leykum hu'rmetli ata-ana! Perzentin'iz ${payment.fio.replace('\t', ' ').toUpperCase()} ${formattedDate} sa'nesinde ${payment.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} swm mug'darinda to'lem qabillandi! To'lem ushin raxmet! - hu'rmet penen RUSTAMBEK OQIW ORAYI Administratciya. tel: 941235151`,
      });
    }
    if (payment.montherPhone) {
      messages.push({
        smsid: Math.floor(Math.random() * (2000 - 100 + 1)) + 100,
        phone: payment.montherPhone,
        text: `Assalawma A'leykum hu'rmetli ata-ana! Perzentin'iz ${payment.fio.replace('\t', ' ').toUpperCase()} ${formattedDate} sa'nesinde ${payment.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} swm mug'darinda to'lem qabillandi! To'lem ushin raxmet! - hu'rmet penen RUSTAMBEK OQIW ORAYI Administratciya. tel: 941235151`,
      });
    }

    const raw = JSON.stringify({
      utime,
      username: process.env.SMS_USERNAME,
      service: {
        service: 4,
      },
      settings: {
        textsource: 'text',
      },
      messages,
    });
    try {
      const response = await fetch(
        'https://routee.sayqal.uz/sms/MulticastSMS',
        {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow',
        },
      );
      const result = await response.text();
      return result;
    } catch (error) {
      return;
    }
  }
}
