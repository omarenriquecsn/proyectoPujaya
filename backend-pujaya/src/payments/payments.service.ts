import {
  Injectable,
  Inject,
  Res,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';
import stripeConfig from '../config/stripe';
import { UsersService } from '../users/users.service';
import { Response, Request } from 'express';
import { UserRole } from '../users/types/roles';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UpdateSubscriptionDto } from './dto/update-suscription.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @Inject(stripeConfig.KEY)
    private stripeConf: ConfigType<typeof stripeConfig>,
    private readonly usersService: UsersService,
  ) {
    this.stripe = new Stripe(this.stripeConf.secretKey || '', {
      apiVersion: this.stripeConf.apiVersion as any,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    plan: 'monthly' | 'annual',
    userId?: string,
  ) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          plan,
          userId: userId || '',
        },
      });
      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error al crear el payment intent:', error.message);
        throw new BadRequestException('Error: ' + error.message);
      }
      throw new BadRequestException('Error Unknown');
    }
  }

  async handleStripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (err) {
      console.error('Error construyendo el evento del webhook:', err);
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    // Procesar evento de pago exitoso
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const userId = paymentIntent.metadata.userId;
      const plan = paymentIntent.metadata.plan;
      console.log('Webhook: payment_intent.succeeded recibido para userId:', userId, 'plan:', plan);
      if (userId && plan) {
        // Calcula la fecha de expiración según el plan
        let subscriptionEndDate: Date | undefined;
        if (plan === 'monthly') {
          subscriptionEndDate = new Date();
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        } else if (plan === 'annual') {
          subscriptionEndDate = new Date();
          subscriptionEndDate.setFullYear(
            subscriptionEndDate.getFullYear() + 1,
          );
        }
        try {
          const updatedUser = await this.usersService.update(userId, {
            role: UserRole.PREMIUM,
            subscriptionEndDate,
            subscriptionStatus: 'active',
          });
          console.log('Usuario actualizado correctamente en webhook:', updatedUser);
        } catch (updateError) {
          console.error('Error actualizando usuario en webhook:', updateError);
        }
      } else {
        console.warn('Webhook: userId o plan no presentes en los metadatos del paymentIntent');
      }
    }
    res.json({ received: true });
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    userId: string,
  ) {
    // Crear la suscripción
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    const paymentIntent = (subscription.latest_invoice as any)?.payment_intent;
    // Guardar datos de la suscripción en el usuario
    await this.usersService.update(userId, {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionEndDate: (subscription as any).current_period_end
        ? new Date((subscription as any).current_period_end * 1000)
        : undefined,
    });

    return {
      clientSecret: paymentIntent?.client_secret,
    };
  }

  // Cron job para bajar de premium a regular si expiró
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async downgradeExpiredPremiumUsers() {
    // Busca todos los usuarios premium cuya suscripción expiró
    const now = new Date();
    const expiredUsers = await this.usersService.findPremiumExpired(now);
    for (const user of expiredUsers) {
      await this.usersService.update(user.id, {
        role: UserRole.REGULAR,
        subscriptionStatus: 'expired',
        subscriptionEndDate: null,
      });
    }
  }

  async updateSubscription(body: UpdateSubscriptionDto) {
    try {
      const subscription = await this.stripe.paymentIntents.retrieve(body.paymentIntentId);
      if (subscription.status === 'succeeded') {
        const user = await this.usersService.findOne(body.userId);
        if (user && body.plan === 'monthly') {
          const subscriptionEndDate = new Date();
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
          await this.usersService.setUserRole(user.firebaseUid, UserRole.PREMIUM);
          await this.usersService.update(user.id, {
            role: UserRole.PREMIUM,
            subscriptionEndDate: subscriptionEndDate,
            subscriptionStatus: 'active',
          });
        }
        if (user && body.plan === 'annual') {
          const subscriptionEndDate = new Date();
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
          await this.usersService.setUserRole(user.firebaseUid, UserRole.PREMIUM);
          await this.usersService.update(user.id, {
            role: UserRole.PREMIUM,
            subscriptionEndDate: subscriptionEndDate,
            subscriptionStatus: 'active',
          });
        }
      }
      return { message: 'Subscription updated successfully' };
    } catch (error) {
      console.error('Error al actualizar la suscripción:', error);
      throw new BadRequestException('Error al actualizar la suscripción');
    }
  }
}
