import { Controller, Get, Param, Query } from '@nestjs/common';
import { SuiService } from './sui.service';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('sui-coins')
@Controller('sui/coins')
export class SuiController {
  constructor(private readonly suiService: SuiService) {}

  @Get('metadata/:coinType')
  @ApiOperation({ 
    summary: 'Get coin metadata', 
    description: 'Returns the metadata for a coin type'
  })
  @ApiParam({ 
    name: 'coinType', 
    description: 'The coin type (e.g. "0x2::sui::SUI" or "0x168da5bf1f48dafc111b0a488fa454aca95e0b5e::usdc::USDC")',
    example: '0x2::sui::SUI'
  })
  async getCoinMetadata(@Param('coinType') coinType: string) {
    return this.suiService.getCoinMetadata(coinType);
  }

  @Get('balance/:owner')
  @ApiOperation({ 
    summary: 'Get all balances for an owner', 
    description: 'Returns all coin balances for a given owner address'
  })
  @ApiParam({ 
    name: 'owner', 
    description: 'The owner address',
    example: '0x123...abc'
  })
  async getAllBalances(@Param('owner') owner: string) {
    return this.suiService.getAllBalances(owner);
  }

  @Get('all/:owner')
  @ApiOperation({ 
    summary: 'Get all coins for an owner', 
    description: 'Returns all coin objects owned by the address'
  })
  @ApiParam({ 
    name: 'owner', 
    description: 'The owner address',
    example: '0x123...abc'
  })
  @ApiQuery({ 
    name: 'cursor', 
    required: false, 
    description: 'Pagination cursor'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Maximum number of items to return',
    type: 'number'
  })
  async getAllCoins(
    @Param('owner') owner: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number
  ) {
    return this.suiService.getAllCoins(owner, cursor, limit);
  }

  @Get('supply/:coinType')
  @ApiOperation({ 
    summary: 'Get total supply', 
    description: 'Returns the total supply for a coin type'
  })
  @ApiParam({ 
    name: 'coinType', 
    description: 'The coin type (e.g. "0x2::sui::SUI")',
    example: '0x2::sui::SUI'
  })
  async getTotalSupply(@Param('coinType') coinType: string) {
    return this.suiService.getTotalSupply(coinType);
  }

  @Get(':owner/:coinType')
  @ApiOperation({ 
    summary: 'Get balance for specific coin type', 
    description: 'Returns the balance of a specific coin type for an owner'
  })
  @ApiParam({ 
    name: 'owner', 
    description: 'The owner address',
    example: '0x123...abc'
  })
  @ApiParam({ 
    name: 'coinType', 
    description: 'The coin type (e.g. "0x2::sui::SUI")',
    example: '0x2::sui::SUI'
  })
  async getBalance(
    @Param('owner') owner: string,
    @Param('coinType') coinType: string
  ) {
    return this.suiService.getBalance(owner, coinType);
  }

  @Get(':owner/:coinType/objects')
  @ApiOperation({ 
    summary: 'Get coin objects', 
    description: 'Returns all coin objects of a specific type owned by the address'
  })
  @ApiParam({ 
    name: 'owner', 
    description: 'The owner address',
    example: '0x123...abc'
  })
  @ApiParam({ 
    name: 'coinType', 
    description: 'The coin type (e.g. "0x2::sui::SUI")',
    example: '0x2::sui::SUI'
  })
  @ApiQuery({ 
    name: 'cursor', 
    required: false, 
    description: 'Pagination cursor'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Maximum number of items to return',
    type: 'number'
  })
  async getCoins(
    @Param('owner') owner: string,
    @Param('coinType') coinType: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number
  ) {
    return this.suiService.getCoins(owner, coinType, cursor, limit);
  }
}

@ApiTags('sui-staking')
@Controller('sui/staking')
export class SuiStakingController {
  constructor(private readonly suiService: SuiService) {}

  @Get('validators/apy')
  @ApiOperation({ 
    summary: 'Get validators APY', 
    description: 'Returns the APY (Annual Percentage Yield) for all validators'
  })
  async getValidatorsApy() {
    return this.suiService.getValidatorsApy();
  }

  @Get(':owner')
  @ApiOperation({ 
    summary: 'Get staking information', 
    description: 'Returns all delegated stakes for the given address'
  })
  @ApiParam({ 
    name: 'owner', 
    description: 'The owner address',
    example: '0x9c76d5157eaa77c41a7bfda8db98a8e8080f7cb53b7313088ed085c73f866f21'
  })
  async getStakes(@Param('owner') owner: string) {
    return this.suiService.getStakes(owner);
  }
} 