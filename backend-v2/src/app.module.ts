import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AgentModule } from './agent/agent.module';
import { UserModule } from './user/user.module';
import { PriceModule } from './price/price.module';
import { ImageModule } from './image/image.module';
import { TokenModule } from './token/token.module';
import { TransactionModule } from './transaction/transaction.module';
import { ChatModule } from './chat/chat.module';
import { OmniModule } from './omni/omni.module';
import { ActionModule } from './action/action.module';
import { SuiModule } from './sui/sui.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    HealthModule,
    AgentModule,
    UserModule,
    PriceModule,
    ImageModule,
    TokenModule,
    TransactionModule,
    ChatModule,
    OmniModule,
    ActionModule,
    SuiModule,
  ],
})
export class AppModule {}
