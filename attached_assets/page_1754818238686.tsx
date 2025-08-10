
'use client';
import { useState } from 'react';
export default function Home(){
  const [amount,setAmount]=useState('1299.00');
  const [resp,setResp]=useState<any>(null);
  async function createIntent(){
    const r=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000'}/payments/intent`,{
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ amount: Number(amount), currency: 'USD' })
    });
    setResp(await r.json());
  }
  return (<div>
    <h1>Helcim Payments + Auto-Issuance (Stub)</h1>
    <p>Use the button to create a mock Helcim intent. Simulate a webhook to issue a policy.</p>
    <label>Amount: <input value={amount} onChange={e=>setAmount(e.target.value)} /></label>
    <button onClick={createIntent}>Create Payment Intent</button>
    <pre>{resp? JSON.stringify(resp,null,2): ''}</pre>
  </div>);
}
