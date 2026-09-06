'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

import { FormSelect } from '@/components/ui/form-select';
import { partnerEnquiry } from '@/lib/site';

const inputClass =
  'focus:border-brand-500 w-full rounded-[4px] border border-[#8C8C8C]/15 bg-white px-[18px] py-[14px] text-[0.9375rem] text-black placeholder:text-black/40 outline-none transition-colors';
const labelClass = 'mb-1.5 block text-[0.8125rem] font-medium text-black/70';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** The white form card on /partner — same field/button styling as ContactForm, different fields. */
export function PartnerEnquiryForm() {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [parkingSpaces, setParkingSpaces] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState('');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    setError(null);

    try {
      const response = await fetch('/api/partner-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, contactName, email, phone, subject, parkingSpaces, message }),
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
      <div className="rounded-none bg-white p-8">
        <p className="font-display text-[1.375rem] font-bold text-black">Enquiry sent.</p>
        <p className="text-sage-500 mt-2 text-[0.9375rem]">
          Thanks for reaching out — we&rsquo;ll get back to you at {sentEmail} soon.
        </p>
        <button
          type="button"
          onClick={() => {
            setBusinessName('');
            setContactName('');
            setEmail('');
            setPhone('');
            setSubject('');
            setParkingSpaces('');
            setMessage('');
            setStatus('idle');
          }}
          className="text-brand-500 mt-4 text-sm font-semibold hover:underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-none bg-white p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="partner-business" className={labelClass}>
            Business / Organization name
          </label>
          <input
            id="partner-business"
            required
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Enter business name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="partner-contact-name" className={labelClass}>
            Your Name
          </label>
          <input
            id="partner-contact-name"
            required
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            placeholder="Enter your name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="partner-email" className={labelClass}>
            Email Address
          </label>
          <input
            id="partner-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email address"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="partner-phone" className={labelClass}>
            Phone number
          </label>
          <input
            id="partner-phone"
            type="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Enter phone number"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="partner-subject" className={labelClass}>
            Subject
          </label>
          <FormSelect
            id="partner-subject"
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            <option value="" disabled>
              Choose a subject for your Email
            </option>
            {partnerEnquiry.subjects.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </FormSelect>
        </div>
        <div>
          <label htmlFor="partner-parking" className={labelClass}>
            Parking Spaces
          </label>
          <input
            id="partner-parking"
            inputMode="numeric"
            value={parkingSpaces}
            onChange={(event) => setParkingSpaces(event.target.value)}
            placeholder="Eg. 50"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="partner-message" className={labelClass}>
          Additional Information
        </label>
        <textarea
          id="partner-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us about your facility, timeline, or any questions…"
          rows={4}
          className={inputClass}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-brand-500 hover:bg-brand-400 border-brand-500 mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[4px] border text-[0.9375rem] font-bold text-white transition-colors disabled:opacity-60"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            Submit Enquiry
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}
