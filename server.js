const express = require('express');
const dotenv = require('dotenv');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// Middleware
// ===========================================

// Security headers (relaxed for inline styles/scripts)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per IP per hour
  message: { error: 'Too many requests from this IP, please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ===========================================
// Ensure data directory exists
// ===========================================
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ===========================================
// Serve static files
// ===========================================
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
}));

// ===========================================
// API: Public configuration
// ===========================================
app.get('/api/config', (req, res) => {
  // Only expose public-safe business information
  res.json({
    name: process.env.BUSINESS_NAME || 'Your Company Name',
    tagline: process.env.BUSINESS_TAGLINE || 'Safe, Reliable & Hassle-Free Moving Services',
    phone: process.env.BUSINESS_PHONE || '',
    whatsapp: process.env.BUSINESS_WHATSAPP || '',
    email: process.env.BUSINESS_EMAIL || '',
    address: process.env.BUSINESS_ADDRESS || '',
    city: process.env.BUSINESS_CITY || '',
    state: process.env.BUSINESS_STATE || '',
    pincode: process.env.BUSINESS_PINCODE || '',
    website: process.env.BUSINESS_WEBSITE || '',
    logo: process.env.BUSINESS_LOGO || '/images/logo.png',
    foundedYear: process.env.BUSINESS_FOUNDED_YEAR || '',
    gst: process.env.BUSINESS_GST || '',
    serviceAreas: process.env.SERVICE_AREAS
      ? process.env.SERVICE_AREAS.split(',').map(s => s.trim())
      : [],
    social: {
      facebook: process.env.SOCIAL_FACEBOOK || '',
      instagram: process.env.SOCIAL_INSTAGRAM || '',
      twitter: process.env.SOCIAL_TWITTER || '',
      youtube: process.env.SOCIAL_YOUTUBE || '',
      linkedin: process.env.SOCIAL_LINKEDIN || '',
    },
    mapsUrl: process.env.GOOGLE_MAPS_EMBED_URL || '',
  });
});

// ===========================================
// API: Submit quote request
// ===========================================
app.post('/api/quote', apiLimiter, (req, res) => {
  const {
    name,
    mobile,
    pickupCity,
    pickupAddress,
    dropCity,
    dropAddress,
    movingDate,
    propertyType,
    numberOfRooms,
    vehicleType,
    additionalRequirements,
    honeypot,
    source,
  } = req.body;

  // Honeypot spam check
  if (honeypot) {
    // Silently reject - don't reveal spam detection
    return res.json({ success: true, leadId: 'LEAD-SPAM', message: 'Quote requested successfully' });
  }

  // Required field validation
  const errors = [];
  if (!name || name.trim().length < 2) {
    errors.push('Full name is required (minimum 2 characters).');
  }
  if (!mobile) {
    errors.push('Mobile number is required.');
  } else {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errors.push('Please enter a valid 10-digit Indian mobile number.');
    }
  }
  if (!pickupCity || pickupCity.trim().length < 2) {
    errors.push('Pickup city is required.');
  }
  if (!dropCity || dropCity.trim().length < 2) {
    errors.push('Drop city is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  // Generate Lead Reference ID
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000).toString();
  const leadId = `LEAD-${dateStr}-${randomNum}`;

  // Clean mobile number
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

  // Build lead record with ALL form fields
  const leadData = {
    id: leadId,
    timestamp: now.toISOString(),
    name: name.trim(),
    mobile: cleanMobile,
    pickupCity: pickupCity.trim(),
    pickupAddress: pickupAddress ? pickupAddress.trim() : '',
    dropCity: dropCity.trim(),
    dropAddress: dropAddress ? dropAddress.trim() : '',
    movingDate: movingDate || '',
    propertyType: propertyType || '',
    numberOfRooms: numberOfRooms || '',
    vehicleType: vehicleType || '',
    additionalRequirements: additionalRequirements ? additionalRequirements.trim() : '',
    source: source || 'website',
    ip: req.ip,
    userAgent: req.get('User-Agent') || '',
  };

  const leadsFile = path.join(dataDir, 'leads.json');

  try {
    let leads = [];
    if (fs.existsSync(leadsFile)) {
      const data = fs.readFileSync(leadsFile, 'utf8');
      if (data.trim()) {
        leads = JSON.parse(data);
      }
    }

    leads.push(leadData);
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));

    console.log(`[LEAD] New lead saved: ${leadId} - ${name} - ${pickupCity} to ${dropCity}`);

    res.json({
      success: true,
      leadId: leadId,
      message: 'Your quote request has been submitted successfully. We will contact you shortly.',
    });
  } catch (error) {
    console.error('[ERROR] Failed to save lead:', error.message);
    res.status(500).json({ error: 'Something went wrong. Please try again or contact us directly.' });
  }
});

// ===========================================
// Page routes
// ===========================================

// Named page routes
const pages = [
  'about',
  'services',
  'contact',
  'privacy-policy',
  'terms',
  'cancellation-policy',
  'refund-policy',
];

pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    const filePath = path.join(__dirname, 'public', `${page}.html`);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  });
});

// ===========================================
// Dynamic location pages
// ===========================================
app.get('/movers-packers-in-:city', (req, res) => {
  const citySlug = req.params.city.toLowerCase();
  const serviceAreas = process.env.SERVICE_AREAS
    ? process.env.SERVICE_AREAS.split(',').map(s => s.trim().toLowerCase().replace(/\s+/g, '-'))
    : [];

  // Check if city is in service areas
  if (!serviceAreas.includes(citySlug)) {
    // Still serve the page but note it's not a primary service area
  }

  const templatePath = path.join(__dirname, 'public', 'location-template.html');

  if (!fs.existsSync(templatePath)) {
    return res.status(404).send('Page not found');
  }

  try {
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Convert slug to proper city name
    const cityName = citySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Replace template placeholders
    template = template.replace(/\{\{CITY_NAME\}\}/g, cityName);
    template = template.replace(/\{\{CITY_SLUG\}\}/g, citySlug);
    template = template.replace(/\{\{BUSINESS_NAME\}\}/g, process.env.BUSINESS_NAME || 'Your Company Name');
    template = template.replace(/\{\{BUSINESS_PHONE\}\}/g, process.env.BUSINESS_PHONE || '');
    template = template.replace(/\{\{BUSINESS_WHATSAPP\}\}/g, process.env.BUSINESS_WHATSAPP || '');
    template = template.replace(/\{\{BUSINESS_EMAIL\}\}/g, process.env.BUSINESS_EMAIL || '');

    res.send(template);
  } catch (error) {
    console.error('[ERROR] Location page error:', error.message);
    res.status(500).send('Something went wrong');
  }
});

// ===========================================
// Homepage
// ===========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===========================================
// 404 handler
// ===========================================
app.use((req, res) => {
  // For unknown routes, serve index.html (SPA-style fallback)
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// ===========================================
// Error handler
// ===========================================
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ===========================================
// Start server
// ===========================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📋 Business: ${process.env.BUSINESS_NAME || 'Not configured'}`);
    console.log(`📍 Service Areas: ${process.env.SERVICE_AREAS || 'Not configured'}`);
  });
}

module.exports = app;
