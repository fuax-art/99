require('dotenv').config();
const express = require('express');
const cors = require('cors');
const products = require('./products');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.get('/products', (req, res) => {
  res.json(products);
});

app.post('/chat', async (req, res) => {
  const { prompt } = req.body;
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  res.send({ text });
});

app.get('/list-models', async (req, res) => {
  try {
    const { models } = await genAI.listModels();
    res.json(models.map(model => ({ name: model.name, supportedGenerationMethods: model.supportedGenerationMethods })));
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).send('Error listing models');
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
