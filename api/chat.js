export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, systemPrompt, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build contents array for Gemini API
    const contents = [];

    // Add system prompt as first message if provided
    if (systemPrompt) {
      contents.push({
        role: "user",
        parts: [{ text: systemPrompt }]
      });
      contents.push({
        role: "model",
        parts: [{ text: "I understand. I'll roleplay as this character and follow these instructions." }]
      });
    }

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      // Limit to last 20 messages to avoid token limits
      const recentHistory = conversationHistory.slice(-20);
      
      recentHistory.forEach(msg => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      });
    }

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const requestBody = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return res.status(200).json({ 
        response: data.candidates[0].content.parts[0].text 
      });
    } else {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ 
      error: 'Failed to get response from AI' 
    });
  }
}