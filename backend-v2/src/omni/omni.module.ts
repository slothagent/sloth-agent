import { Module } from '@nestjs/common';
import { OmniController } from './omni.controller';
import { OmniService } from './omni.service';
import { ImageModule } from '../image/image.module';
import { ActionModule } from '../action/action.module';
import { PriceModule } from '../price/price.module';

@Module({
  imports: [ImageModule, ActionModule, PriceModule],
  controllers: [OmniController],
  providers: [OmniService],
})
export class OmniModule {} 