import { Module } from '@nestjs/common';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';
import { ListingsModule } from '../listings/listings.module';
import { MarketplaceSearchService } from './services/marketplace-search.service';
import { LookbookService } from './services/lookbook.service';
import { LookbookIdentityService } from './lookbooks/lookbook-identity.service';
import { LOOKBOOK_REPOSITORY, createLookbookRepository } from './lookbooks/lookbook.repository';

@Module({
  // ListingsModule exports the single shared ListingsService instance, so search sees
  // listings created through POST /listings (Seller Studio) immediately.
  imports: [ListingsModule],
  controllers: [DiscoveryController],
  providers: [
    DiscoveryService,
    MarketplaceSearchService,
    LookbookIdentityService,
    LookbookService,
    { provide: LOOKBOOK_REPOSITORY, useFactory: () => createLookbookRepository(process.env) },
  ],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
