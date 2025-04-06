import { Module } from '@nestjs/common';
import { OmniController } from './omni.controller';
import { OmniService } from './omni.service';
import { ImageModule } from '../image/image.module';
import { PriceModule } from '../price/price.module';
import { SuiModule } from '../sui/sui.module';

@Module({
  imports: [ImageModule, PriceModule, SuiModule],
  controllers: [OmniController],
  providers: [OmniService],
})
export class OmniModule {} 