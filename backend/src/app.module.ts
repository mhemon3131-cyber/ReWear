import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ListingsModule } from './modules/listings/listings.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { SustainabilityModule } from './modules/sustainability/sustainability.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    ListingsModule,       // Seller Copilot & Multi-Mode Inventory
    DiscoveryModule,      // AI Visual & Semantic Search
    TransactionsModule,   // Checkout, Swap Matchmaker, Escrow & Rentals
    SustainabilityModule, // Fashion Coach & Circularity Impact
    AiModule,             // Shared AI Service Integration
  ],
})
export class AppModule {}
