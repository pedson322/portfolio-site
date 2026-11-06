require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // needed behind Render/Netlify-style proxies for rate limiting
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ['https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || false })); // only needed if the frontend is hosted elsewhere
app.use(express.json({ limit: '10kb' }));

// Serve the website
app.use(express.static(path.join(__dirname, 'public')));

// Allow 5 messages per IP per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Please try again later.' }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

app.post('/api/contact', limiter, async (req, res) => {
  const { name, email, message, website } = req.body || {};

  if (website) return res.json({ ok: true }); // honeypot: bots fill it in, pretend success

  if (![name, email, message].every((v) => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'Please fill in every field.' });
  }
  if (name.length > 80 || email.length > 120 || message.length > 2000) {
    return res.status(400).json({ error: 'One of the fields is too long.' });
  }
  if (!emailOk(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio contact form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: `${name.replace(/[\r\n"<>]/g, '')} <${email}>`,
      subject: `Portfolio message from ${name.replace(/[\r\n]/g, ' ')}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p><p>${esc(message).replace(/\n/g, '<br>')}</p>`
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err.message);
    res.status(500).json({ error: 'Could not send your message right now. Please email me directly.' });
  }
});

app.listen(PORT, () => console.log(`Portfolio running on http://localhost:${PORT}`));
