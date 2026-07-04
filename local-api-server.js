const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Save data endpoint
app.post('/api/save-data', (req, res) => {
  try {
    const newData = req.body;
    
    if (!newData.nodes || !newData.links) {
      return res.status(400).json({ error: 'Invalid data structure' });
    }
    
    const filePath = path.join(__dirname, 'public', 'data', 'graphData.json');
    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');
    
    console.log('Data saved successfully');
    return res.status(200).json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    return res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
  console.log('Now you can save data directly in local development!');
});
