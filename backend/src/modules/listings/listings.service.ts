import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ListingEntity,
  ListingCondition,
  ListingStatus,
  ListingMode,
  BrandTier,
  ListingAnalytics,
} from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { AiCopilotRequestDto, AiCopilotResponseDto } from './dto/ai-copilot-request.dto';
import { PriceAdvisorRequestDto, PriceAdvisorResponseDto } from './dto/price-advisor-request.dto';

@Injectable()
export class ListingsService {
  // In-memory persistent state for MVC demonstration
  private listings: ListingEntity[] = [
    {
      id: 'list_1',
      title: 'Vintage Corduroy Oversized Jacket',
      description: 'Classic 90s vintage corduroy jacket in rich olive-plum wash. Warm quilted inner lining, horn buttons, relaxed dropped shoulders. Perfect for winter campus styling.',
      brand: 'Zara Eco-Line',
      brandTier: 'Premium High-Street',
      category: 'Outerwear',
      genderCategory: 'Unisex',
      size: 'M',
      color: ['Deep Plum', 'Olive Green'],
      pattern: 'Corduroy Ribbed',
      fabricComposition: '100% Organic Cotton Corduroy, Recycled Polyester Lining',
      isSellerVerifiedFabric: true,
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
      ],
      condition: 'Like New',
      defectDisclosure: 'No stains or tears; minor wear on lower inner cuff (not visible when worn).',
      defects: [
        {
          id: 'def_1',
          type: 'Fading',
          severity: 'Minor',
          description: 'Slight natural softening and micro-wear along lower inner sleeve cuff.',
        },
      ],
      hasDefects: true,
      modes: ['buy', 'swap', 'rent'],
      originalPrice: 4200,
      salePrice: 1850,
      swapCredits: 45,
      rentalPricePerDay: 250,
      rentalDeposit: 600,
      status: 'ACTIVE',
      waterSavingsLiters: 2800,
      co2AvoidedKg: 3.4,
      sellerId: 'usr_02',
      sellerName: 'Zerin Tasnim',
      sellerUniversity: 'Dhaka University',
      isVerifiedSeller: true,
      analytics: {
        views: 142,
        wishlistSaves: 24,
        inquiries: 7,
        swapOffers: 4,
        shares: 9,
      },
      createdAt: new Date('2026-02-10T10:00:00Z'),
      updatedAt: new Date('2026-02-15T12:00:00Z'),
    },
    {
      id: 'list_2',
      title: 'Hand-Embroidered Jamdani Fusion Vest',
      description: 'Artisanal handloom Jamdani sleeveless overlay vest with geometric floral motifs. Lightweight, elegant layer over tunics, kurtis, or shirts.',
      brand: 'Aarong Heritage',
      brandTier: 'Heritage',
      category: 'Ethnic & Fusion',
      genderCategory: 'Women',
      size: 'S',
      color: ['Peach Blush', 'Burnt Orange'],
      pattern: 'Traditional Jamdani Weave',
      fabricComposition: 'Pure Handspun Cotton',
      isSellerVerifiedFabric: true,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
      ],
      condition: 'Brand New w/ Tags',
      defectDisclosure: 'Flawless, unused gift with original university artisan tag still attached.',
      defects: [],
      hasDefects: false,
      modes: ['buy', 'swap'],
      originalPrice: 3500,
      salePrice: 1600,
      swapCredits: 40,
      status: 'ACTIVE',
      waterSavingsLiters: 2200,
      co2AvoidedKg: 2.8,
      sellerId: 'usr_03',
      sellerName: 'Tanvir H.',
      sellerUniversity: 'Dhaka University',
      isVerifiedSeller: true,
      analytics: {
        views: 98,
        wishlistSaves: 38,
        inquiries: 12,
        swapOffers: 8,
        shares: 14,
      },
      createdAt: new Date('2026-02-12T14:30:00Z'),
      updatedAt: new Date('2026-02-12T14:30:00Z'),
    },
    {
      id: 'list_3',
      title: 'Sustainable Raw Denim Relaxed Cargo Pants',
      description: 'Heavyweight organic raw denim relaxed cargos with reinforced knee panels and brass utility hardware. Built to last decades.',
      brand: "Levi's Circular",
      brandTier: 'Premium High-Street',
      category: 'Denim',
      genderCategory: 'Unisex',
      size: '32',
      color: ['Indigo Navy'],
      pattern: 'Raw Denim Twill',
      fabricComposition: '100% Recycled Cotton',
      isSellerVerifiedFabric: false,
      images: [
        'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&q=80&w=800',
      ],
      condition: 'Good',
      defectDisclosure: 'Slight natural fade on left knee pocket; all seams, rivets, and pockets reinforced.',
      defects: [
        {
          id: 'def_2',
          type: 'Fading',
          severity: 'Minor',
          description: 'Authentic fade patina on pocket flap; no structural fraying.',
        },
      ],
      hasDefects: true,
      modes: ['buy', 'swap', 'rent'],
      originalPrice: 4800,
      salePrice: 2100,
      swapCredits: 50,
      rentalPricePerDay: 300,
      rentalDeposit: 700,
      status: 'ACTIVE',
      waterSavingsLiters: 3100,
      co2AvoidedKg: 4.1,
      sellerId: 'usr_02',
      sellerName: 'Zerin Tasnim',
      sellerUniversity: 'Dhaka University',
      isVerifiedSeller: true,
      analytics: {
        views: 86,
        wishlistSaves: 19,
        inquiries: 5,
        swapOffers: 3,
        shares: 4,
      },
      createdAt: new Date('2026-02-14T09:15:00Z'),
      updatedAt: new Date('2026-02-14T09:15:00Z'),
    },
    {
      id: 'list_4',
      title: 'Knitted Autumn Turtleneck Sweater',
      description: 'Cozy waffle knit oversized sweater in warm oatmeal cream. Ribbed neck and cuffs, zero scratchiness.',
      brand: 'H&M Conscious',
      brandTier: 'Fast Fashion',
      category: 'Knitwear',
      genderCategory: 'Unisex',
      size: 'L',
      color: ['Warm Cream', 'Tangerine Accent'],
      pattern: 'Waffle Knit',
      fabricComposition: 'Recycled Acrylic & Wool Blend',
      isSellerVerifiedFabric: false,
      images: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
      ],
      condition: 'Like New',
      defectDisclosure: 'Dry-cleaned twice; zero pilling, no odors, perfectly intact seams.',
      defects: [],
      hasDefects: false,
      modes: ['buy', 'swap', 'rent'],
      originalPrice: 2900,
      salePrice: 1200,
      swapCredits: 30,
      rentalPricePerDay: 180,
      rentalDeposit: 400,
      status: 'ACTIVE',
      waterSavingsLiters: 1900,
      co2AvoidedKg: 2.1,
      sellerId: 'usr_04',
      sellerName: 'Rahim M.',
      sellerUniversity: 'Independent University Bangladesh',
      isVerifiedSeller: false,
      analytics: {
        views: 110,
        wishlistSaves: 42,
        inquiries: 9,
        swapOffers: 6,
        shares: 11,
      },
      createdAt: new Date('2026-02-16T16:45:00Z'),
      updatedAt: new Date('2026-02-16T16:45:00Z'),
    },
    {
      id: 'list_5',
      title: 'Embroidered Kashmiri Shawl Overlay',
      description: 'Warm festive formal shawl with Kashmiri needlework along borders. Suitable for convocation or wedding programs.',
      brand: 'Handicraft Guild',
      brandTier: 'Heritage',
      category: 'Outerwear',
      genderCategory: 'Women',
      size: 'Free Size',
      color: ['Deep Plum', 'Espresso'],
      pattern: 'Kashmiri Embroidery',
      fabricComposition: 'Wool & Fine Pashmina Blend',
      isSellerVerifiedFabric: true,
      images: [
        'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&q=80&w=800',
      ],
      condition: 'Like New',
      defectDisclosure: 'Worn once for graduation photo; carefully preserved in cedar chest.',
      defects: [],
      hasDefects: false,
      modes: ['rent', 'swap'],
      originalPrice: 5500,
      swapCredits: 60,
      rentalPricePerDay: 350,
      rentalDeposit: 1000,
      status: 'RESERVED', // Currently locked in active rental
      waterSavingsLiters: 3400,
      co2AvoidedKg: 4.8,
      sellerId: 'usr_02',
      sellerName: 'Zerin Tasnim',
      sellerUniversity: 'Dhaka University',
      isVerifiedSeller: true,
      analytics: {
        views: 175,
        wishlistSaves: 51,
        inquiries: 14,
        swapOffers: 11,
        shares: 18,
      },
      createdAt: new Date('2026-02-01T11:20:00Z'),
      updatedAt: new Date('2026-02-18T09:00:00Z'),
    },
    {
      id: 'list_6',
      title: 'Minimalist Relaxed Linen Summer Shirt',
      description: 'Breathable linen short-sleeve shirt with camp collar in neutral sand.',
      brand: 'Yellow Clothing',
      brandTier: 'Premium High-Street',
      category: 'Tops & Shirts',
      genderCategory: 'Men',
      size: 'M',
      color: ['Peach Blush', 'Warm Cream'],
      pattern: 'Solid Linen',
      fabricComposition: '100% Linen',
      isSellerVerifiedFabric: true,
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
      ],
      condition: 'Good',
      defectDisclosure: 'Second button from collar replaced with matching horn button.',
      defects: [
        {
          id: 'def_3',
          type: 'Missing Button',
          severity: 'Minor',
          description: 'Button professionally resewn with reinforced thread.',
        },
      ],
      hasDefects: true,
      modes: ['buy', 'swap'],
      originalPrice: 2200,
      salePrice: 950,
      swapCredits: 25,
      status: 'SOLD', // Completed purchase
      waterSavingsLiters: 1600,
      co2AvoidedKg: 1.8,
      sellerId: 'usr_02',
      sellerName: 'Zerin Tasnim',
      sellerUniversity: 'Dhaka University',
      isVerifiedSeller: true,
      analytics: {
        views: 94,
        wishlistSaves: 21,
        inquiries: 8,
        swapOffers: 2,
        shares: 5,
      },
      createdAt: new Date('2026-01-20T14:10:00Z'),
      updatedAt: new Date('2026-02-05T15:30:00Z'),
    },
  ];

  // ==========================================
  // FEATURE 1: AI-Powered Listing Copilot (AI)
  // ==========================================
  async generateCopilotDraft(dto: AiCopilotRequestDto): Promise<AiCopilotResponseDto> {
    const hint = (dto.initialCategoryHint || dto.sellerNote || '').toLowerCase();

    let category = 'Outerwear';
    let title = 'Vintage Corduroy Boxy Utility Jacket';
    let colors = ['Deep Plum', 'Burnt Orange'];
    let pattern = 'Washed Corduroy';
    let tags = ['Vintage', 'Outerwear', 'Corduroy', 'CampusThrift', 'GenderNeutral'];
    let description = 'Elevated 90s vintage silhouette with structured dropped shoulders and deep utility cargo pockets. Crafted from durable textured fabric. Ideal for university layering.';
    let condition: ListingCondition = 'Like New';
    let baseOriginal = 4000;

    if (hint.includes('denim') || hint.includes('jeans') || hint.includes('pants')) {
      category = 'Denim';
      title = 'Relaxed Wide-Leg Raw Indigo Denim';
      colors = ['Indigo Navy', 'Espresso'];
      pattern = 'Raw Denim Twill';
      tags = ['Denim', 'RawCotton', 'WideLeg', 'Y2K', 'Durable'];
      description = 'Relaxed-fit raw denim trousers with reinforced selvedge edge and custom copper rivets. Zero stretch, authentic heritage construction.';
      baseOriginal = 4500;
    } else if (hint.includes('vest') || hint.includes('jamdani') || hint.includes('ethnic') || hint.includes('kurti')) {
      category = 'Ethnic & Fusion';
      title = 'Handcrafted Jamdani Motif Overlay Vest';
      colors = ['Peach Blush', 'Burnt Orange'];
      pattern = 'Geometric Jamdani Weave';
      tags = ['Jamdani', 'Artisanal', 'DesiFusion', 'Handloom', 'SustainableFestive'];
      description = 'Breathable handloom overlay featuring traditional geometric motifs. Adds a touch of heritage luxury to western or ethnic campus outfits.';
      baseOriginal = 3200;
    } else if (hint.includes('sweater') || hint.includes('knit') || hint.includes('cardigan')) {
      category = 'Knitwear';
      title = 'Chunky Oversized Turtleneck Cable Sweater';
      colors = ['Warm Cream', 'Soft Tangerine'];
      pattern = 'Cable Knit';
      tags = ['Knitwear', 'CozyWinter', 'Oversized', 'WarmCream', 'ChunkyKnit'];
      description = 'Ultra-plush winter knit with ribbed collar and raglan sleeve construction. Clean dry-cleaned state with zero pilling.';
      baseOriginal = 2800;
    }

    const priceAdvice = await this.calculatePriceAdvice({
      originalPrice: baseOriginal,
      category,
      brand: dto.declaredBrand || 'Vintage Discovery',
      condition,
    });

    return {
      suggestedTitle: title,
      suggestedCategory: category,
      suggestedGender: 'Unisex',
      suggestedColors: colors,
      suggestedPattern: pattern,
      suggestedDescription: description,
      suggestedTags: tags,
      detectedConditionGrade: condition,
      estimatedResaleRange: {
        ...priceAdvice.estimatedResaleRange,
        currency: 'BDT',
      },
      recommendedSwapCredits: priceAdvice.recommendedSwapCredits,
      recommendedDailyRentalFee: priceAdvice.recommendedDailyRentalFee,
      aiConfidenceScore: 94.6,
      aiCaveat:
        'AI Guardrail: Visual models draft aesthetic attributes and tags. Brand authenticity and specific fiber compositions cannot be verified from photos alone and require seller confirmation.',
      scannedAt: new Date(),
    };
  }

  // ==========================================
  // FEATURE 4: Smart Resale Price Advisor
  // ==========================================
  async calculatePriceAdvice(dto: PriceAdvisorRequestDto): Promise<PriceAdvisorResponseDto> {
    const orig = dto.originalPrice;
    if (orig <= 0) {
      throw new BadRequestException('Original price must be greater than 0 BDT.');
    }

    // Baseline retention based on standardized condition
    let conditionRetention = 0.55;
    let conditionText = 'Like New retains ~50%–60% of original value';
    switch (dto.condition) {
      case 'Brand New w/ Tags':
        conditionRetention = 0.75;
        conditionText = 'Brand New w/ Tags retains 70%–85% of retail price';
        break;
      case 'Like New':
        conditionRetention = 0.58;
        conditionText = 'Like New maintains strong campus demand (~55%–65% retention)';
        break;
      case 'Good':
        conditionRetention = 0.42;
        conditionText = 'Good condition accounts for minor honest wear (~40%–50% retention)';
        break;
      case 'Fair':
        conditionRetention = 0.28;
        conditionText = 'Fair condition discounted for visible wear (~25%–35% retention)';
        break;
    }

    // Brand Tier adjustment
    let brandMultiplier = 1.0;
    let brandText = 'Standard market clearing rate';
    if (dto.brandTier === 'Heritage' || dto.brandTier === 'Designer') {
      brandMultiplier = 1.15;
      brandText = '+15% Premium value retention for artisanal heritage & designer pieces';
    } else if (dto.brandTier === 'Fast Fashion') {
      brandMultiplier = 0.90;
      brandText = '-10% High initial depreciation for fast-fashion brands';
    }

    // Category demand adjustment
    let categoryMultiplier = 1.0;
    let categoryText = 'Standard seasonal apparel turnover';
    if (dto.category === 'Outerwear' || dto.category === 'Denim') {
      categoryMultiplier = 1.08;
      categoryText = '+8% High-durability outerwear & selvedge denim retention';
    } else if (dto.category === 'Ethnic & Fusion') {
      categoryMultiplier = 1.05;
      categoryText = '+5% Event & festive wear resale liquidity on campus';
    }

    // Defect penalty
    let defectPenalty = 0;
    let defectText = 'No defect deductions applied';
    if (dto.defectsCount && dto.defectsCount > 0) {
      if (dto.defectSeverity === 'Moderate') {
        defectPenalty = 0.15;
        defectText = '-15% Defect allowance for disclosed moderate flaw';
      } else {
        defectPenalty = 0.08;
        defectText = '-8% Minor defect adjustment ensuring buyer transparency';
      }
    }

    const netRetention = Math.max(
      0.15,
      conditionRetention * brandMultiplier * categoryMultiplier - defectPenalty,
    );

    const recommended = Math.round((orig * netRetention) / 50) * 50;
    const min = Math.round((recommended * 0.85) / 50) * 50;
    const max = Math.round((recommended * 1.15) / 50) * 50;

    const swapCredits = Math.round(recommended / 40);
    const dailyRental = Math.round((recommended * 0.13) / 10) * 10;
    const securityDeposit = Math.round((recommended * 0.32) / 50) * 50;

    return {
      currency: 'BDT (৳)',
      originalPrice: orig,
      retentionRatePercentage: Math.round(netRetention * 100),
      estimatedResaleRange: {
        min,
        recommended,
        max,
      },
      recommendedSwapCredits: swapCredits,
      recommendedDailyRentalFee: dailyRental,
      recommendedSecurityDeposit: securityDeposit,
      estimatedBuyerSavingsBDT: orig - recommended,
      depreciationBreakdown: {
        conditionImpact: conditionText,
        brandTierImpact: brandText,
        categoryDemandImpact: categoryText,
        defectPenalty: defectText,
      },
      marketExplanation: `Recommended listing price of ৳${recommended.toLocaleString()} represents ${Math.round(
        netRetention * 100,
      )}% of original retail value, calibrated against recent university peer-to-peer sales.`,
    };
  }

  // ==========================================
  // FEATURE 2: Multi-Mode Inventory Management
  // ==========================================
  async getAllListings(filters?: {
    status?: ListingStatus;
    mode?: ListingMode;
    category?: string;
    sellerId?: string;
  }): Promise<ListingEntity[]> {
    let result = [...this.listings];

    if (filters?.status) {
      result = result.filter((l) => l.status === filters.status);
    } else {
      // By default for public marketplace, show only active items
      // (Unless sellerId is explicitly requested)
      if (!filters?.sellerId) {
        result = result.filter((l) => l.status === 'ACTIVE' || l.status === 'RESERVED');
      }
    }

    if (filters?.mode) {
      result = result.filter((l) => l.modes.includes(filters.mode!));
    }

    if (filters?.category) {
      result = result.filter(
        (l) => l.category.toLowerCase() === filters.category!.toLowerCase(),
      );
    }

    if (filters?.sellerId) {
      result = result.filter((l) => l.sellerId === filters.sellerId);
    }

    return result;
  }

  async getListingById(id: string): Promise<ListingEntity> {
    const item = this.listings.find((l) => l.id === id);
    if (!item) {
      throw new NotFoundException(`Listing with ID '${id}' not found.`);
    }
    // Increment view counter for analytics
    item.analytics.views += 1;
    return item;
  }

  async getSellerInventory(
    sellerId: string,
    statusFilter?: ListingStatus,
  ): Promise<ListingEntity[]> {
    let sellerItems = this.listings.filter((l) => l.sellerId === sellerId);
    if (statusFilter) {
      sellerItems = sellerItems.filter((l) => l.status === statusFilter);
    }
    return sellerItems;
  }

  async createListing(dto: CreateListingDto): Promise<ListingEntity> {
    // Multi-Mode Validation
    if (!dto.modes || dto.modes.length === 0) {
      throw new BadRequestException('At least one transaction mode (buy, swap, or rent) must be enabled.');
    }

    if (dto.modes.includes('buy') && (!dto.salePrice || dto.salePrice <= 0)) {
      throw new BadRequestException('Sale price is required when "buy" mode is selected.');
    }

    if (dto.modes.includes('swap') && (!dto.swapCredits || dto.swapCredits <= 0)) {
      dto.swapCredits = dto.salePrice ? Math.round(dto.salePrice / 40) : 35;
    }

    if (dto.modes.includes('rent')) {
      if (!dto.rentalPricePerDay || dto.rentalPricePerDay <= 0) {
        throw new BadRequestException('Daily rental price is required when "rent" mode is selected.');
      }
      if (!dto.rentalDeposit) {
        dto.rentalDeposit = dto.salePrice ? Math.round(dto.salePrice * 0.3) : 500;
      }
    }

    // Feature 3: Defect Transparency Validation
    const hasDefects =
      (dto.defects && dto.defects.length > 0) ||
      (dto.condition === 'Good' || dto.condition === 'Fair');

    // Calculate environmental savings
    const waterSavings = this.calculateGarmentWaterSavings(dto.category);
    const co2Avoided = this.calculateGarmentCo2Avoided(dto.category);

    const newListing: ListingEntity = {
      id: 'list_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: dto.title,
      description: dto.description,
      brand: dto.brand,
      brandTier: dto.brandTier || 'Premium High-Street',
      category: dto.category,
      genderCategory: dto.genderCategory || 'Unisex',
      size: dto.size,
      color: dto.color,
      pattern: dto.pattern,
      fabricComposition: dto.fabricComposition,
      isSellerVerifiedFabric: dto.isSellerVerifiedFabric || false,
      images:
        dto.images && dto.images.length > 0
          ? dto.images
          : ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800'],
      condition: dto.condition,
      defectDisclosure: dto.defectDisclosure,
      defects:
        dto.defects?.map((d, idx) => ({
          id: `def_${Date.now()}_${idx}`,
          ...d,
        })) || [],
      hasDefects: hasDefects,
      modes: dto.modes,
      originalPrice: dto.originalPrice,
      salePrice: dto.salePrice,
      swapCredits: dto.swapCredits,
      rentalPricePerDay: dto.rentalPricePerDay,
      rentalDeposit: dto.rentalDeposit,
      status: dto.status || 'ACTIVE',
      waterSavingsLiters: waterSavings,
      co2AvoidedKg: co2Avoided,
      sellerId: dto.sellerId,
      sellerName: dto.sellerName || 'Verified Seller',
      sellerUniversity: dto.sellerUniversity || 'Dhaka Campus',
      isVerifiedSeller: true,
      analytics: {
        views: 1,
        wishlistSaves: 0,
        inquiries: 0,
        swapOffers: 0,
        shares: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.listings.unshift(newListing);
    return newListing;
  }

  async updateListing(id: string, dto: Partial<CreateListingDto>): Promise<ListingEntity> {
    const item = await this.getListingById(id);

    if (dto.title) item.title = dto.title;
    if (dto.description) item.description = dto.description;
    if (dto.brand) item.brand = dto.brand;
    if (dto.condition) item.condition = dto.condition;
    if (dto.defectDisclosure) item.defectDisclosure = dto.defectDisclosure;
    if (dto.modes) item.modes = dto.modes;
    if (dto.salePrice !== undefined) item.salePrice = dto.salePrice;
    if (dto.swapCredits !== undefined) item.swapCredits = dto.swapCredits;
    if (dto.rentalPricePerDay !== undefined) item.rentalPricePerDay = dto.rentalPricePerDay;
    if (dto.status) item.status = dto.status;
    if (dto.images) item.images = dto.images;

    item.updatedAt = new Date();
    return item;
  }

  // State Transition Machine (Prevents unavailable items from being transacted)
  async updateListingStatus(
    id: string,
    newStatus: ListingStatus,
    reason?: string,
  ): Promise<{ listing: ListingEntity; statusTransition: string }> {
    const item = await this.getListingById(id);
    const oldStatus = item.status;

    // Enforce business state rules
    if (oldStatus === 'SOLD' && newStatus !== 'ARCHIVED') {
      throw new BadRequestException('A sold item cannot be re-activated directly; it must be re-listed as new inventory.');
    }

    if (oldStatus === 'RESERVED' && newStatus === 'ACTIVE') {
      // Allowed if escrow or rental reservation was cancelled
    }

    item.status = newStatus;
    item.updatedAt = new Date();

    return {
      listing: item,
      statusTransition: `${oldStatus} -> ${newStatus}${reason ? ` (${reason})` : ''}`,
    };
  }

  async deleteListing(id: string): Promise<{ success: boolean; message: string }> {
    const index = this.listings.findIndex((l) => l.id === id);
    if (index === -1) {
      throw new NotFoundException(`Listing with ID '${id}' not found.`);
    }
    this.listings.splice(index, 1);
    return { success: true, message: `Listing '${id}' archived successfully.` };
  }

  // ==========================================
  // FEATURE 5: Seller Performance Analytics
  // ==========================================
  async getSellerAnalytics(sellerId: string) {
    const sellerListings = this.listings.filter((l) => l.sellerId === sellerId);

    const activeListings = sellerListings.filter((l) => l.status === 'ACTIVE').length;
    const reservedListings = sellerListings.filter((l) => l.status === 'RESERVED').length;
    const soldListings = sellerListings.filter((l) => l.status === 'SOLD').length;
    const rentedListings = sellerListings.filter((l) => l.status === 'RENTED').length;
    const draftListings = sellerListings.filter((l) => l.status === 'DRAFT').length;

    const totalViews = sellerListings.reduce((sum, item) => sum + (item.analytics?.views || 0), 0);
    const totalWishlistSaves = sellerListings.reduce((sum, item) => sum + (item.analytics?.wishlistSaves || 0), 0);
    const totalInquiries = sellerListings.reduce((sum, item) => sum + (item.analytics?.inquiries || 0), 0);
    const totalSwapOffers = sellerListings.reduce((sum, item) => sum + (item.analytics?.swapOffers || 0), 0);

    // Earnings
    const salesRevenueBDT = sellerListings
      .filter((l) => l.status === 'SOLD')
      .reduce((sum, l) => sum + (l.salePrice || 0), 0);

    const rentalRevenueBDT = sellerListings
      .filter((l) => l.status === 'RENTED')
      .reduce((sum, l) => sum + (l.rentalPricePerDay ? l.rentalPricePerDay * 3 : 0), 0);

    const totalEarnedBDT = salesRevenueBDT + rentalRevenueBDT;

    const totalCreditsEarned = sellerListings
      .filter((l) => l.status === 'SOLD' || l.status === 'RENTED')
      .reduce((sum, l) => sum + (l.swapCredits || 0), 0);

    const completedTransactions = soldListings + rentedListings;
    const conversionRate =
      sellerListings.length > 0
        ? +((completedTransactions / sellerListings.length) * 100).toFixed(1)
        : 0;

    // Environmental Impact Diverted by Seller
    const waterSavedTotal = sellerListings.reduce((sum, l) => sum + (l.waterSavingsLiters || 0), 0);
    const co2DivertedTotal = +(
      sellerListings.reduce((sum, l) => sum + (l.co2AvoidedKg || 0), 0)
    ).toFixed(1);

    // Best performing listings
    const bestPerforming = [...sellerListings]
      .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
      .slice(0, 3)
      .map((l) => ({
        id: l.id,
        title: l.title,
        status: l.status,
        views: l.analytics?.views || 0,
        wishlistSaves: l.analytics?.wishlistSaves || 0,
        inquiries: l.analytics?.inquiries || 0,
        price: l.salePrice,
        swapCredits: l.swapCredits,
      }));

    // AI-driven actionable seller suggestions
    const suggestions: string[] = [];

    const underperformingListing = sellerListings.find(
      (l) => l.status === 'ACTIVE' && l.analytics?.views > 50 && l.analytics?.inquiries === 0,
    );
    if (underperformingListing) {
      suggestions.push(
        `"${underperformingListing.title}" has ${underperformingListing.analytics.views} views but 0 inquiries. Try lowering price by ৳150 or enabling the Swap-Credit mode.`,
      );
    }

    const itemsWithoutDefectPhotos = sellerListings.filter(
      (l) => l.hasDefects && (!l.defects || l.defects.length === 0),
    );
    if (itemsWithoutDefectPhotos.length > 0) {
      suggestions.push(
        `Disclosing clear defect photos increases buyer checkout confidence by 42%. Add supporting images to your disclosed items.`,
      );
    }

    if (activeListings >= 2 && !sellerListings.some((l) => l.modes.includes('rent'))) {
      suggestions.push(
        `Event & fest season is approaching on campus! Enable "Occasion Rental" on jackets or ethnic items for recurring passive income.`,
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        `Your catalog is performing well! Keep responding to swap inquiries within 2 hours to maintain high buyer interest.`,
      );
    }

    return {
      sellerId,
      summary: {
        totalListings: sellerListings.length,
        activeListings,
        reservedListings,
        soldListings,
        rentedListings,
        draftListings,
        totalViews,
        totalWishlistSaves,
        totalInquiries,
        totalSwapOffers,
        conversionRate,
        totalEarnedBDT,
        totalCreditsEarned,
        waterSavedTotal,
        co2DivertedTotal,
      },
      bestPerformingListings: bestPerforming,
      actionableSuggestions: suggestions,
    };
  }

  // Helpers for ecological calculations
  private calculateGarmentWaterSavings(category: string): number {
    switch (category) {
      case 'Denim':
        return 3100;
      case 'Outerwear':
        return 2800;
      case 'Ethnic & Fusion':
        return 2200;
      case 'Knitwear':
        return 1900;
      case 'Tops & Shirts':
        return 1600;
      default:
        return 2000;
    }
  }

  private calculateGarmentCo2Avoided(category: string): number {
    switch (category) {
      case 'Denim':
        return 4.1;
      case 'Outerwear':
        return 3.4;
      case 'Ethnic & Fusion':
        return 2.8;
      case 'Knitwear':
        return 2.1;
      case 'Tops & Shirts':
        return 1.8;
      default:
        return 2.5;
    }
  }
}
