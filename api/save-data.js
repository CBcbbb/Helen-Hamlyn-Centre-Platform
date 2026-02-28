import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the data from request body
    const newData = req.body;
    
    // Validate data structure
    if (!newData.nodes || !newData.links) {
      return res.status(400).json({ error: 'Invalid data structure' });
    }
    
    // Define file path
    const filePath = path.join(process.cwd(), 'public', 'data', 'graphData.json');
    
    // Save data to file
    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');
    
    return res.status(200).json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    return res.status(500).json({ error: 'Failed to save data' });
  }
}
