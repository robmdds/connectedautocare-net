
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
    <h1>TPA Platform – Replit Starter</h1>
    <p>Helcim-only payments stub. Use the button to create a mock payment intent.</p>
    <label>Amount: <input value={amount} onChange={e=>setAmount(e.target.value)} /></label>
    <button onClick={createIntent} style={{marginLeft:8}}>Create Payment Intent</button>
    <pre>{resp? JSON.stringify(resp,null,2): ''}</pre>
    <p>API health: <a href="http://localhost:4000/health" target="_blank">/health</a></p>
  </div>);
}
