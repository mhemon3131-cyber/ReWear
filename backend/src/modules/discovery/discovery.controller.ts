import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('feed')
  async getFeed(@Query('userId') userId: string) {
    return this.discoveryService.getCuratedFeed(userId);
  }

  @Post('ai-search')
  async search(@Body('query') query: string) {
    return this.discoveryService.semanticSearch(query);
  }
}
