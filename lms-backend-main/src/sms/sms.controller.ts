import { Body, Controller, Post } from '@nestjs/common';
import { SMSService } from './sms.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('SMS')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SMSService) {}

  @ApiOperation({ summary: 'Отправить SMS-рассылку должникам' })
  @Post('/debtors-group')
  async sendDebtorsSMS(@Body() debtors: any): Promise<any> {
    // Разделяем каждого студента по телефонам
    const allMessages = [];

    for (const debtor of debtors) {
      const rounded = Math.ceil(Math.abs(debtor.balance) / 1000) * 1000;
      if (debtor.motherPhone) {
        allMessages.push({
          smsid: Math.floor(Math.random() * (2000 - 100 + 1)) + 100,
          phone: debtor.motherPhone,
          text: `Eskertiw! Hu'rmetli ata-ana RUSTAMBEK OQIW ORAYInda oquwshi perzentin'iz ${debtor.fio.replace('\t', ' ').toUpperCase()} ${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} swm qarizdarlig'i bar! RUSTAMBEK OQIW ORAYI Administratciya. tel: 941235151`,
        });
      }
      if (debtor.fatherPhone) {
        allMessages.push({
          smsid: Math.floor(Math.random() * (2000 - 100 + 1)) + 100,
          phone: debtor.fatherPhone,
          text: `Eskertiw! Hu'rmetli ata-ana RUSTAMBEK OQIW ORAYInda oquwshi perzentin'iz ${debtor.fio.replace('\t', ' ').toUpperCase()} ${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} swm qarizdarlig'i bar! RUSTAMBEK OQIW ORAYI Administratciya. tel: 941235151`,
        });
      }
    }

    // Функция для разделения на части по 100 штук
    const chunkArray = (array, chunkSize) => {
      const result = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
      }
      return result;
    };

    // Разбиваем все сообщения на группы по 100
    const messageGroups = chunkArray(allMessages, 100);

    // Отправляем группы сообщений
    for (const group of messageGroups) {
      await this.smsService.sendDebtors(group);
    }

    return { success: true, totalMessagesSent: allMessages.length };
  }
}
