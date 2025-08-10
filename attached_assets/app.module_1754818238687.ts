
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PaymentsModule } from './payments/payments.module';
import { PoliciesModule } from './policies/policies.module';
@Module({ imports: [PoliciesModule, PaymentsModule], controllers: [HealthController] })
export class AppModule {}
