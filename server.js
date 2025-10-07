require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const VOLLEY_API_URL = process.env.VOLLEY_API_URL;
const VOLLEY_AUTH_KEY = process.env.VOLLEY_AUTH_KEY;
const VOLLEY_BANK_ACCOUNT_ID = process.env.VOLLEY_BANK_ACCOUNT_ID;

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

// Embedded route - creates Volley request and renders template
app.get('/embedded', async (req, res) => {
  try {
    const volleyRequest = {
      bank_account_id: VOLLEY_BANK_ACCOUNT_ID,
      amount: `0.50 NZD`,
      message: `Demo Store Purchase`,
      type: "single",
      reference: `VOLLEYDEMO`,
      flow: "checkout",
      success_redirect_url: "https://volley.nz/success",
      failure_redirect_url: "https://volley.nz/failure",
    };

    // Call the Volley API
    const response = await fetch(VOLLEY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VOLLEY_AUTH_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(volleyRequest)
    });

    const volleyResponse = await response.json();

    if (response.ok && volleyResponse.request) {
      // Render the EJS template with the request_id
      res.render('embedded', {
        requestId: volleyResponse.request.id
      });
    } else {
      console.error('Volley API Error:', volleyResponse);
      res.status(400).send('Failed to create payment request');
    }
  } catch (error) {
    console.error('Error calling Volley API:', error);
    res.status(500).send('Server error');
  }
});

// API endpoint for Volley payment processing
app.post('/api/requests', async (req, res) => {
  try {
    const volleyRequest = {
      bank_account_id: VOLLEY_BANK_ACCOUNT_ID,
      amount: `0.50 NZD`,
      message: `Demo Store Purchase`,
      type: "single",
      reference: `VOLLEYDEMO`,
      flow: "checkout",
      success_redirect_url: "https://volley.nz/success",
      failure_redirect_url: "https://volley.nz/failure",
    };

    // Call the Volley API
    const response = await fetch(VOLLEY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VOLLEY_AUTH_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(volleyRequest)
    });

    const volleyResponse = await response.json();

    console.log('Volley API Response:', JSON.stringify(volleyResponse, null, 2));
    if (response.ok && volleyResponse.request) {
      res.json({
        success: true,
        paymentUrl: volleyResponse.request.url,
        requestId: volleyResponse.request.id
      });
    } else {
      console.error('Volley API Error:', volleyResponse);
      res.status(400).json({
        success: false,
        message: 'Payment request failed'
      });
    }

  } catch (error) {
    console.error('Error calling Volley API:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Volley DemoStore running on http://localhost:${PORT}`);
});
