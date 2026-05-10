import { Global, Module } from '@nestjs/common';
import { RedisThrottlerStorage } from './redis-throttler.storage';

/**
 * Выделенный модуль под Redis-storage throttler'а.
 *
 * Причина: `ThrottlerModule.forRootAsync({ inject: [RedisThrottlerStorage] })`
 * резолвит зависимости в момент инициализации самого ThrottlerModule, а не
 * AppModule. Если RedisThrottlerStorage объявлен в `AppModule.providers`,
 * DI не видит его здесь. @Global + exports решает проблему.
 */
@Global()
@Module({
  providers: [RedisThrottlerStorage],
  exports: [RedisThrottlerStorage],
})
export class ThrottlerStorageModule {}
