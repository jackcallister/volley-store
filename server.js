const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

// API endpoint for Volley payment processing
app.post('/api/process-payment', (req, res) => {
  const { amount, productId, customerEmail } = req.body;

  // Simulate Volley payment processing
  console.log('Processing Volley payment:', { amount, productId, customerEmail });

  // For demo purposes, randomly succeed or fail
  const success = Math.random() > 0.2; // 80% success rate

  setTimeout(() => {
    if (success) {
      res.json({
        success: true,
        transactionId: 'volley_' + Date.now(),
        message: 'Payment processed successfully with Volley!'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.'
      });
    }
  }, 1500); // Simulate processing delay
});

app.listen(PORT, () => {
  console.log(`Volley DemoStore running on http://localhost:${PORT}`);
});
