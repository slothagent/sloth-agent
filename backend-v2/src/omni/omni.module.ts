import { Module } from '@nestjs/common';
import { OmniController } from './omni.controller';
import { OmniService } from './omni.service';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [ImageModule],
  controllers: [OmniController],
  providers: [OmniService],
})
export class OmniModule {} 