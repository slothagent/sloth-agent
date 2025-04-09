import { Controller, Get } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller()
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('binance-eth-price')
  async getEthPrice() {
    return this.priceService.getEthPrice();
  }

  @Get('sonic-price')
  async getSonicPrice() {
    return this.priceService.getSonicPrice();
  }
} 