import { Controller, Get, Post, Body } from '@nestjs/common';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  async getListings() {
    return this.listingsService.getAllListings();
  }

  @Post('ai-copilot')
  async aiCopilot(@Body() body: any) {
    return this.listingsService.generateCopilotDraft(body);
  }
}
