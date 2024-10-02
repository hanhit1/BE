const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://example.com', 
  methods: ['GET', 'POST'],     
  credentials: true             
}));

app.get('/api', (req, res) => {
  res.json({ message: 'CORS enabled' });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});