import { Module } from '@nestjs/common';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { DatabaseModule } from '../database/database.module';
import { CoinGeckoService } from './coingecko.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TokenController],
  providers: [TokenService, CoinGeckoService],
  exports: [TokenService],
})
export class TokenModule {} 