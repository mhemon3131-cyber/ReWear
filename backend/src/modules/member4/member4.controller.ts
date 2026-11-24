import { Body, Controller, Get, Param, Post, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { Member4Service } from './member4.service';

@Controller('member4')
export class Member4Controller {
  constructor(private readonly service: Member4Service) {}
  @Post('impact') impact(@Body() body: { category: string; quantity: number }) { return this.service.impact(body); }
  @Post('coach') coach(@Body() body: { question: string; fabric?: string; mode?: string }) { return this.service.coach(body); }
  @Get('reviews/:sellerId') reviews(@Param('sellerId') sellerId: string) { return this.service.reviews(sellerId); }
  @Post('reviews') review(@Body() body: { orderId: string; sellerId: string; rating: number; comment: string }, @Headers('authorization') authorization?: string) {
    return this.service.addReview(body, authorization);
  }
  @Get('wardrobe') wardrobe(@Headers('authorization') authorization?: string) { return this.service.wardrobe(authorization); }
  @Post('wardrobe') addWardrobe(@Body() body: { title: string; category: string; purchasePrice: number; wears?: number }, @Headers('authorization') authorization?: string) { return this.service.addWardrobe(body, authorization); }
  @Post('wardrobe/:id/wear') wear(@Param('id') id: string, @Headers('authorization') authorization?: string) { return this.service.recordWear(id, authorization); }
  @Get('events') events() { return this.service.events(); }
  @Post('events') createEvent(@Body() body: { title: string; location: string; startsAt: string; capacity: number }, @Headers('authorization') authorization?: string) { return this.service.createEvent(body, authorization); }
  @Post('events/:id/join') join(@Param('id') id: string, @Headers('authorization') authorization?: string) { return this.service.joinEvent(id, authorization); }
  @Get('challenges') challenges(@Headers('authorization') authorization?: string) { return this.service.challenges(authorization); }
  @Post('challenges/:id/complete') complete(@Param('id') id: string, @Headers('authorization') authorization?: string) { return this.service.completeChallenge(id, authorization); }
}
