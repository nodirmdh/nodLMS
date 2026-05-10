import { SetMetadata } from '@nestjs/common';

/**
 * Маркер "публичный эндпоинт". Используем как документационный тег —
 * реальное исключение из AuthMiddleware прописывается в `AppModule.configure`.
 */
export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);
