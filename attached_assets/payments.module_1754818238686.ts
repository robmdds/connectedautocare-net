
import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PoliciesModule } from '../policies/policies.module';

@Module({ imports: [PoliciesModule], providers: [PaymentsService], controllers: [PaymentsController] })
export class PaymentsModule {}
