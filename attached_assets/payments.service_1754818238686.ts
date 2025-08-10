
export class PaymentsService {
  async createPaymentIntent(amount: number, currency: string, description?: string){
    return {
      provider: 'helcim',
      amount,
      currency,
      description: description || 'TPA Purchase',
      clientSecret: 'mock_client_secret_replace_with_helcim_token',
    };
  }
}
