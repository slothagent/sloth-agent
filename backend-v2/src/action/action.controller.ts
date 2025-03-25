import { Controller, Post, Body } from '@nestjs/common';
import { ActionService } from './action.service';

@Controller('action')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post('analyze')
  async analyzeUserInput(@Body('input') userInput: string) {
    return this.actionService.parseUserInput(userInput);
  }
} 