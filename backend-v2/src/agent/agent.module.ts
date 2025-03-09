import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { DatabaseModule } from '../database/database.module';
import { TwitterAuthController } from './twitter-auth.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AgentController, TwitterAuthController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {} 