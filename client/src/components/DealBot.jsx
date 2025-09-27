import React, { useState, useRef } from 'react';
import { api } from '../api';

export default function DealBot({ onSelectProduct }) {
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! Ask me things such as "best price for iPhone 14" or "show history for Redmi Note".' }]);
  const [input, setInput] = useState('');
  const boxRef = useRef();

  async function send() {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages(m => [...m, { from: 'user', text }]);
    setInput('');
    try {
      const res = await api.post('/chat', { message: text });
      const reply = res.data.reply || 'Sorry, no reply.';
      setMessages(m => [...m, { from: 'bot', text: reply }]);
      // If reply contains a product id selection pattern (not implemented) — we could parse links
    } catch (err) {
      setMessages(m => [...m, { from: 'bot', text: 'Error: ' + (err.response?.data?.message || err.message) }]);
    } finally {
      // scroll
      setTimeout(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, 50);
    }
  }

  return (
    <div>
      <h3>Deal Bot</h3>
      <div className="chatbox" ref={boxRef} style={{ display:'flex', flexDirection:'column' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
            <div className={`msg ${m.from === 'user' ? 'user' : 'bot'}`}>{m.text}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:8, display:'flex', gap:8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder='e.g. "best price for iPhone 14"' style={{ flex:1 }} />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
