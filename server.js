require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const VOLLEY_API_URL = process.env.VOLLEY_API_URL;
const VOLLEY_AUTH_KEY = process.env.VOLLEY_AUTH_KEY;
const VOLLEY_BANK_ACCOUNT_ID = process.env.VOLLEY_BANK_ACCOUNT_ID;

const CANTEEN_API_URL = process.env.CANTEEN_API_URL;
const CANTEEN_AUTH_KEY = process.env.CANTEEN_AUTH_KEY;
const CANTEEN_BANK_ACCOUNT_ID = process.env.CANTEEN_BANK_ACCOUNT_ID;

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

app.get('/success', (req, res) => {
  const requestId = req.query.request_id || null;
  const paymentId = req.query.payment_id || null;

  const now = new Date();
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Pacific/Auckland'
  };
  const date = now.toLocaleDateString('en-NZ', options);

  res.render('success', {
    requestId,
    paymentId,
    date
  });
});

app.get('/donation', async (req, res) => {
  try {
    const donationRequest = {
      bank_account_id: CANTEEN_BANK_ACCOUNT_ID,
      message: `Donation to Canteen`,
      type: "single",
      amount: "5.00 NZD",
      reference: `DONATION`,
      expires_in: "5m",
      flow: "checkout",
      success_redirect_url: "https://volley-store.fly.dev/success",
      failure_redirect_url: "https://volley-store.fly.dev/failure",
    };

    const response = await fetch(CANTEEN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CANTEEN_AUTH_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(donationRequest)
    });

    const volleyResponse = await response.json();

    console.log('Donation API Response:', volleyResponse);

    if (response.ok && volleyResponse.request) {
      res.render('donation', {
        requestUrl: volleyResponse.request.url
      });
    } else {
      console.error('Donation API Error:', volleyResponse);
      res.status(400).send('Failed to create donation request');
    }
  } catch (error) {
    console.error('Error calling Canteen API:', error);
    res.status(500).send('Server error');
  }
});

app.get('/embedded', async (req, res) => {
  try {
    const volleyRequest = {
      bank_account_id: VOLLEY_BANK_ACCOUNT_ID,
      amount: `0.50 NZD`,
      message: `Demo Store Purchase`,
      type: "single",
      reference: `VOLLEYDEMO`,
      expires_in: "5m",
      flow: "checkout",
      success_redirect_url: "https://volley.nz/success",
      failure_redirect_url: "https://volley.nz/failure",
    };

    const response = await fetch(VOLLEY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VOLLEY_AUTH_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(volleyRequest)
    });

    const volleyResponse = await response.json();

    console.log('Volley API Response:', volleyResponse)

    if (response.ok && volleyResponse.request) {
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


async function fetchBankAccounts() {
  try {
    console.log('Fetching bank accounts...');
    const response = await fetch("https://api.volley.nz/v1/bank-accounts", {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VOLLEY_AUTH_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const bankAccounts = await response.json();
    console.log('Bank Accounts Response:', JSON.stringify(bankAccounts, null, 2));
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
  }
}


app.listen(PORT, async () => {
  console.log(`Volley DemoStore running on http://localhost:${PORT}`);
  // fetchBankAccounts()
});
