
import { Controller, Post, Body, Req, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PoliciesService } from '../policies/policies.service';

@Controller()
export class PaymentsController {
  constructor(private payments: PaymentsService, private policies: PoliciesService) {}

  @Post('/payments/intent')
  async intent(@Body() body: any){
    const amount = Number(body?.amount || 0);
    const currency = String(body?.currency || 'USD');
    return this.payments.createPaymentIntent(amount, currency);
  }

  @Post('/webhooks/helcim')
  async webhooks(@Req() req: any, @Headers() headers: any){
    const event = req.body || {};
    // TODO: Verify signature using HELCIM_WEBHOOK_SECRET and Helcim's header scheme.
    if (event?.type === 'payment.succeeded') {
      const result = await this.policies.issueForPayment(event?.data || event);
      return { received: true, issued: result };
    }
    return { received: true };
  }
}
