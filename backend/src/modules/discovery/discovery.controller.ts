import { Controller, Get, Post, Put, Delete, Query, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { MarketplaceSearchService } from './services/marketplace-search.service';
import { LookbookService } from './services/lookbook.service';
import { SearchListingsDto } from './dto/search-listings.dto';
import { SaveLookbookDto } from './dto/save-lookbook.dto';

@Controller('discovery')
export class DiscoveryController {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly marketplaceSearchService: MarketplaceSearchService,
    private readonly lookbookService: LookbookService,
  ) {}

  @Get('feed')
  async getFeed(@Query('userId') userId: string) {
    return this.discoveryService.getCuratedFeed(userId);
  }

  @Post('ai-search')
  async search(@Body('query') query: string) {
    return this.discoveryService.semanticSearch(query);
  }

  // Member 2 - Feature 6: Advanced Multi-Filter Marketplace Search
  @Get('search')
  async marketplaceSearch(@Query() dto: SearchListingsDto) {
    return this.marketplaceSearchService.search(dto);
  }

  // Member 2 - Feature 10: Outfit Builder & Digital Lookbook
  @Get('lookbooks/status')
  async lookbookStatus() {
    return this.lookbookService.status();
  }

  @Get('lookbooks')
  async listLookbooks() {
    return this.lookbookService.list();
  }

  @Get('lookbooks/:id')
  async getLookbook(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.lookbookService.get(id);
  }

  @Post('lookbooks')
  async createLookbook(@Body() dto: SaveLookbookDto) {
    return this.lookbookService.create(dto);
  }

  @Put('lookbooks/:id')
  async updateLookbook(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: SaveLookbookDto) {
    return this.lookbookService.update(id, dto);
  }

  @Delete('lookbooks/:id')
  async deleteLookbook(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.lookbookService.remove(id);
  }
}
