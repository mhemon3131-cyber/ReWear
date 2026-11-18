import { Injectable } from '@nestjs/common';

@Injectable()
export class SustainabilityService {
  // Member 4: AI Circular Fashion Coach & Impact Calculations
  calculateImpact(itemsCount: number) {
    return {
      itemsRescued: itemsCount,
      waterSavedLiters: itemsCount * 2700,
      co2AvoidedKg: +(itemsCount * 3.8).toFixed(1),
      textileWasteDivertedKg: +(itemsCount * 0.85).toFixed(1),
    };
  }

  async askFashionCoach(question: string, fabricType?: string) {
    return {
      question,
      advice: 'For delicate cotton blends, soak in cold water with mild enzymatic detergent. Avoid high heat dryer.',
      fabricCaution: 'Do not use bleach or wire bristles on knitwear.',
      potentialCostSavedBDT: 1500,
    };
  }
}
