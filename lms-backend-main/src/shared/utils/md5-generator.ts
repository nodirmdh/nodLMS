import { MD5 } from 'crypto-js';

export function generateTransmitAccessToken(
  type: 'MulticastSMS' | 'TransmitSMS' | 'StatusSMS',
): any {
  const utime = Math.floor(Date.now() / 1000);
  const userName = process.env.SMS_USERNAME || '';
  const secretKey = process.env.SMS_SECRET_KEY || '';

  const access = `${type} ${userName} ${secretKey} ${utime}`;

  return {
    hash: MD5(access).toString(),
    utime,
  };
}
