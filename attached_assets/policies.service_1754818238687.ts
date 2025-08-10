
import * as fs from 'fs';
import * as path from 'path';

export class PoliciesService {
  private policyDir = path.join(process.cwd(), 'storage', 'policies');
  private receiptDir = path.join(process.cwd(), 'storage', 'receipts');

  constructor() {
    fs.mkdirSync(this.policyDir, { recursive: true });
    fs.mkdirSync(this.receiptDir, { recursive: true });
  }

  generatePolicyNumber() {
    const ts = Date.now();
    return `POL-{${ts}}`;
  }

  async issueForPayment(payload: any) {
    const policyNumber = this.generatePolicyNumber();
    const policy = {
      policyNumber,
      issuedAt: new Date().toISOString(),
      amount: payload?.amount || null,
      currency: payload?.currency || 'USD',
      purchaserEmail: payload?.customer?.email || payload?.email || null,
      providerRef: payload?.id || payload?.providerRef || null,
      meta: payload
    };

    const receipt = {
      policyNumber,
      receiptId: `RCT-{${Date.now()}}`,
      createdAt: new Date().toISOString(),
      lineItems: [{ description: 'Service Contract', amount: policy.amount, currency: policy.currency }]
    };

    const policyPath = path.join(this.policyDir, `${policyNumber}.json`);
    const receiptPath = path.join(this.receiptDir, `${receipt.receiptId}.json`);

    fs.writeFileSync(policyPath, JSON.stringify(policy, null, 2));
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));

    return { policyNumber, policyPath, receiptPath };
  }
}
