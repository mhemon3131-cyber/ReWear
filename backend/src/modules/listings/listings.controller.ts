import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { AiCopilotRequestDto } from './dto/ai-copilot-request.dto';
import { PriceAdvisorRequestDto } from './dto/price-advisor-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ListingStatus, ListingMode } from './entities/listing.entity';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  // 1. Member 1 Feature: AI-Powered Listing Copilot
  @Post('ai-copilot')
  @HttpCode(HttpStatus.OK)
  async generateCopilotDraft(@Body() dto: AiCopilotRequestDto) {
    return this.listingsService.generateCopilotDraft(dto);
  }

  // 4. Member 1 Feature: Smart Resale Price Advisor
  @Post('price-advisor')
  @HttpCode(HttpStatus.OK)
  async calculatePriceAdvice(@Body() dto: PriceAdvisorRequestDto) {
    return this.listingsService.calculatePriceAdvice(dto);
  }

  // 5. Member 1 Feature: Seller Performance Analytics Dashboard
  @Get('analytics/:sellerId')
  async getSellerAnalytics(@Param('sellerId') sellerId: string) {
    return this.listingsService.getSellerAnalytics(sellerId);
  }

  // 2. Member 1 Feature: Multi-Mode Inventory Management (Get seller's items)
  @Get('seller/:sellerId')
  async getSellerInventory(
    @Param('sellerId') sellerId: string,
    @Query('status') status?: ListingStatus,
  ) {
    return this.listingsService.getSellerInventory(sellerId, status);
  }

  // Browse all listings with mode/category/status filters
  @Get()
  async getListings(
    @Query('status') status?: ListingStatus,
    @Query('mode') mode?: ListingMode,
    @Query('category') category?: string,
    @Query('sellerId') sellerId?: string,
  ) {
    return this.listingsService.getAllListings({ status, mode, category, sellerId });
  }

  // Get single listing with Defect Transparency details
  @Get(':id')
  async getListingById(@Param('id') id: string) {
    return this.listingsService.getListingById(id);
  }

  // Create new listing (Draft or Published)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createListing(@Body() dto: CreateListingDto) {
    return this.listingsService.createListing(dto);
  }

  // Update existing listing details
  @Put(':id')
  async updateListing(@Param('id') id: string, @Body() dto: Partial<CreateListingDto>) {
    return this.listingsService.updateListing(id, dto);
  }

  // Update listing status (Transactional state machine: DRAFT/ACTIVE/RESERVED/SOLD/RENTED)
  @Patch(':id/status')
  async updateListingStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.listingsService.updateListingStatus(id, dto.status, dto.reason);
  }

  // Delete/archive listing
  @Delete(':id')
  async deleteListing(@Param('id') id: string) {
    return this.listingsService.deleteListing(id);
  }
}
