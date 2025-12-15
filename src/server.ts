import express from 'express';
import cors from 'cors';
import path from 'path';
import { runWorkflow } from './workflow';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Main workflow endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { input } = req.body;
    
    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }
    
    console.log('Processing request:', input);
    
    const result = await runWorkflow({ input_as_text: input });
    
    res.json(result);
  } catch (error: any) {
    console.error('Workflow error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
});

// Serve the frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 YouTube Agent running at http://localhost:${PORT}`);
});
