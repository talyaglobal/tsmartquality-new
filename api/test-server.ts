import express from 'express';

const app = express();

app.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/test', (req, res) => {
  res.json({ success: true, data: req.body });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});