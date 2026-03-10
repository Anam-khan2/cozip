import { useState } from 'react';
import { Clock, Mail, Phone, Send } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { showErrorToast, showSuccessToast } from '../lib/notifications';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name || !email || !subject || !message) {
      showErrorToast('Message not sent', 'Please complete every field before submitting the form.');
      return;
    }

    showSuccessToast('Message sent', `Thanks ${name}. We will reply to ${email} soon.`);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <Header />

      <main className="store-section">
        <div className="store-shell">
          <Breadcrumbs items={[{ label: 'Contact' }]} className="mb-6" />
          <header className="mb-12 text-center">
            <h1 className="mb-4 text-5xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
              Get in Touch
            </h1>
            <p className="mx-auto max-w-2xl text-lg" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.6 }}>
              Have a question or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </header>

          <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <article className="rounded-3xl p-10" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}>
              <h2 className="mb-6 text-3xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
                Contact Information
              </h2>
              <p className="mb-8" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.7 }}>
                We're here to help with any questions about our products, orders, or just to chat about all things cozy.
              </p>

              <div className="mb-10 space-y-6">
                {[
                  {
                    icon: <Mail className="h-5 w-5" style={{ color: '#7A9070' }} aria-hidden="true" />,
                    title: 'Email',
                    body: <a href="mailto:hello@cozip.com" className="transition-all hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>hello@cozip.com</a>,
                  },
                  {
                    icon: <Phone className="h-5 w-5" style={{ color: '#7A9070' }} aria-hidden="true" />,
                    title: 'Phone',
                    body: <a href="tel:+1234567890" className="transition-all hover:opacity-70" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>+1 (234) 567-890</a>,
                  },
                  {
                    icon: <Clock className="h-5 w-5" style={{ color: '#7A9070' }} aria-hidden="true" />,
                    title: 'Business Hours',
                    body: <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>Monday - Friday: 9am - 6pm<br />Saturday: 10am - 4pm<br />Sunday: Closed</p>,
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="rounded-xl p-3" style={{ backgroundColor: '#F0F4F0' }}>{item.icon}</div>
                    <div>
                      <h3 className="mb-1 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>{item.title}</h3>
                      {item.body}
                    </div>
                  </div>
                ))}
              </div>

              <img src="https://images.unsplash.com/photo-1771499931738-8ba90af8cae1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwd29ya3NwYWNlJTIwZGVzayUyMG11ZyUyMGNvZmZlZSUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzI4Mzk5NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Cozy workspace with mugs and coffee" className="w-full rounded-3xl" style={{ aspectRatio: '16 / 10', objectFit: 'cover', border: '2px solid #F0F4F0' }} />
            </article>

            <article className="rounded-3xl p-10" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}>
              <h2 className="mb-6 text-3xl" style={{ fontFamily: 'Playfair Display, serif', color: '#4A5D45', fontWeight: 600 }}>
                Send us a Message
              </h2>
              <p className="mb-8" style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', lineHeight: 1.7 }}>
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="name" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>Your Name</label>
                  <input type="text" id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your full name" className="w-full rounded-xl px-4 py-3 transition-all" style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none' }} onFocus={(event) => { event.target.style.borderColor = '#7A9070'; }} onBlur={(event) => { event.target.style.borderColor = '#E5E7EB'; }} required />
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>Email Address</label>
                  <input type="email" id="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your.email@example.com" className="w-full rounded-xl px-4 py-3 transition-all" style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none' }} onFocus={(event) => { event.target.style.borderColor = '#7A9070'; }} onBlur={(event) => { event.target.style.borderColor = '#E5E7EB'; }} required />
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>Subject</label>
                  <input type="text" id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What's this about?" className="w-full rounded-xl px-4 py-3 transition-all" style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none' }} onFocus={(event) => { event.target.style.borderColor = '#7A9070'; }} onBlur={(event) => { event.target.style.borderColor = '#E5E7EB'; }} required />
                </div>

                <div className="mb-8">
                  <label htmlFor="message" className="mb-2 block text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 600 }}>Message</label>
                  <textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what's on your mind..." rows={6} className="w-full resize-none rounded-xl px-4 py-3 transition-all" style={{ border: '2px solid #E5E7EB', fontFamily: 'Inter, sans-serif', color: '#4A5D45', outline: 'none' }} onFocus={(event) => { event.target.style.borderColor = '#7A9070'; }} onBlur={(event) => { event.target.style.borderColor = '#E5E7EB'; }} required />
                </div>

                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 transition-all hover:scale-[1.02]" style={{ backgroundColor: '#7A9070', color: '#FFFFFF', boxShadow: '0 4px 16px rgba(122, 144, 112, 0.3)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '1rem' }} aria-label="Send contact message">
                  <Send className="h-5 w-5" aria-hidden="true" />
                  Send Message
                </button>
              </form>
            </article>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}