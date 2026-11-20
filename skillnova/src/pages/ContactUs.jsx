import React, { useState } from 'react';
import './ContactUs.css';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch('http://localhost:5137/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('✅ Message sent!');
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      setStatus('❌ Could not send message');
    }
  };

  return (
    <div className="contact-page">
      <h1 className="contact-title">Contact Us</h1>
      <p className="contact-intro">
        If you have any questions, feel free to get in touch with us via phone,
        email, or the form below.
      </p>

      <div className="contact-grid">
        {/* ===== Left: Form ===== */}
        <div className="contact-form-box">
          <h2 className="section-heading">Get in Touch</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="two-col">
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your message"
              value={form.message}
              onChange={handleChange}
              required
            />
            <button type="submit" className="btn-submit">Send Message</button>
          </form>
          {status && <p className="status">{status}</p>}
        </div>

        {/* ===== Right: Info ===== */}
        <div className="contact-info">
          <div className="info-block">
            <h3>Contact Information</h3>
            <p>📞 773-986-5840</p>
            <p>✉️ support@skillswap.com</p>
            <p>📍 1425 N McLean Blvd, Elgin, IL</p>
          </div>

          <div className="info-block">
            <h3>Business Hours</h3>
            <p>Mon–Fri: 9:00 am – 8:00 pm</p>
            <p>Sat: 9:00 am – 6:00 pm</p>
            <p>Sun: 9:00 am – 5:00 pm</p>
          </div>
        </div>
      </div>

      {/* ===== Map ===== */}
      <iframe
        title="map"
        src="https://www.google.com/maps/embed?pb=!1m18..."
        loading="lazy"
        allowFullScreen
        className="contact-map"
      ></iframe>
    </div>
  );
}
