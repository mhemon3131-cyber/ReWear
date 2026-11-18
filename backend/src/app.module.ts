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
    ListingsModule,       // Member 1: Seller Copilot & Multi-Mode Inventory
    DiscoveryModule,      // Member 2: AI Search & Lookbooks
    TransactionsModule,   // Member 3 (You): Swaps, Rentals & Checkout
    SustainabilityModule, // Member 4: Fashion Coach & Impact
    AiModule,             // Shared AI Service Integration
  ],
})
export class AppModule {}
