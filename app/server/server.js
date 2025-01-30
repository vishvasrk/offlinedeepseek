const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama');
const axios = require('axios'); // Import axios for sending HTTP requests

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Initialize Ollama
const ollama = new Ollama({
  model: 'deepseek-r1:7b', // Replace with your model name
});

// Root route
app.get('/', (req, res) => {
  res.send('Server is running. Use the /chat endpoint to interact with DeepSeek.');
});

// Endpoint to handle prompts
app.post('/chat', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const result = await ollama.generate({ model: "deepseek-r1:7b", prompt });
    res.json({ response: result.response });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Ping route to keep the server alive
app.get('/ping', (req, res) => {
  res.status(200).send('Ping received!');
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
  
  // Ping the server every 2 seconds to prevent idle timeout
  setInterval(() => {
    axios.get(`http://localhost:${port}/ping`)
      .then(response => {
        console.log('Ping successful:', response.status);
      })
      .catch(error => {
        console.error('Error pinging server:', error.message);
      });
  }, 2000); // Ping every 2 seconds
});
