import { Controller, Post, Body, Req, Res, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UpdateSubscriptionDto } from './dto/update-suscription.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiBody({ type: CreatePaymentIntentDto })
  async createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
    console.log('BODY RECIBIDO EN BACKEND:', body);
    const paymentIntent = await this.paymentsService.createPaymentIntent(
      body.amount,
      body.currency,
      body.plan,
      body.userId,
    );
    console.log('PAYMENT INTENT:', paymentIntent);
    return paymentIntent;
  }

  @Post('create-subscription')
  @ApiBody({ type: CreateSubscriptionDto })
  async createSubscription(@Body() body: CreateSubscriptionDto) {
    return await this.paymentsService.createSubscription(
      body.customerId,
      body.priceId,
      body.userId,
    );
  }

  // Webhook endpoint for Stripe
  @Post('webhook')
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    console.log('WEBHOOK RECIBIDO EN BACKEND:', req.body, res);
    return this.paymentsService.handleStripeWebhook(req, res);
  }

  @Post('update-subscription')
  @ApiBody({ type: UpdateSubscriptionDto })
  @ApiOperation({ summary: 'Update subscription' })
  async updateSubscription(@Body() body: UpdateSubscriptionDto) {
    return await this.paymentsService.updateSubscription(body);
  }
}
