import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SustainabilityService } from './sustainability.service';

@Controller('sustainability')
export class SustainabilityController {
  constructor(private readonly sustainabilityService: SustainabilityService) {}

  @Get('calculate')
  calculate(@Query('items') items: string) {
    return this.sustainabilityService.calculateImpact(parseInt(items) || 1);
  }

  @Post('coach')
  async coach(@Body() body: { question: string; fabricType?: string }) {
    return this.sustainabilityService.askFashionCoach(body.question, body.fabricType);
  }
}
