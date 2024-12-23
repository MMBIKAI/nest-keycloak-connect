// token.module.ts
import { Module } from '@nestjs/common';
import { TokenService } from './token.treat';

@Module({
  providers: [TokenService],
  exports: [TokenService], // Export TokenService so other modules can use it
})
export class TokenModule {}
