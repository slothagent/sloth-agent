import { Module } from '@nestjs/common';
import { SuiController, SuiStakingController } from './sui.controller';
import { SuiService } from './sui.service';

@Module({
  imports: [],
  controllers: [SuiController, SuiStakingController],
  providers: [SuiService],
  exports: [SuiService],
})
export class SuiModule {} 