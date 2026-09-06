'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

import { FormSelect } from '@/components/ui/form-select';
import { contactPage } from '@/lib/site';

const inputClass =
  'focus:border-brand-500 w-full rounded-[4px] border border-[#8C8C8C]/15 bg-white px-[18px] py-[14px] text-[0.9375rem] text-black placeholder:text-black/40 outline-none transition-colors';
const labelClass = 'mb-1.5 block text-[0.8125rem] font-medium text-black/70';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  // Snapshot of the address used for the sent message — the form fields
  // themselves get cleared once the visitor starts a new one.
  const [sentEmail, setSentEmail] = useState('');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data: { error?: string } = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setSentEmail(email);
      setStatus('success');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="reveal-up rounded-lg border border-black/10 bg-white p-8" style={{ '--rev-start': '10%', '--rev-end': '50%' } as React.CSSProperties}>
        <p className="font-display text-[1.375rem] font-bold text-black">Message sent.</p>
        <p className="text-sage-500 mt-2 text-[0.9375rem]">
          Thanks for reaching out — we&rsquo;ll get back to you at {sentEmail} soon.
        </p>
        <button
          type="button"
          onClick={() => {
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
            setStatus('idle');
          }}
          className="text-brand-500 mt-4 text-sm font-semibold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="reveal-up space-y-5" style={{ '--rev-start': '8%', '--rev-end': '52%' } as React.CSSProperties}>
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Full Name
        </label>
        <input
          id="contact-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your full name"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email address"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className={labelClass}>
            Subject
          </label>
          <FormSelect
            id="contact-subject"
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            <option value="" disabled>
              Choose a subject for your Email
            </option>
            {contactPage.subjects.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Your Message
        </label>
        <textarea
          id="contact-message"
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Message"
          rows={5}
          className={inputClass}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-brand-500 hover:bg-brand-400 border-brand-500 flex h-12 w-full items-center justify-center gap-2 rounded-[4px] border text-[0.9375rem] font-bold text-white transition-colors disabled:opacity-60"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            Send Message
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}
