import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import 'dotenv/config'; // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY; 
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';

// --- Middleware Setup ---
app.use(bodyParser.json());

// Set up CORS headers to allow requests from your front-end (assuming it's running on a different port or domain)
app.use((req, res, next) => {
    // You should restrict this origin to your front-end URL in a production environment
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// --- API Endpoint ---
app.post('/api/generate-special', async (req, res) => {
    if (!API_KEY) {
        console.error("API Key is missing in .env file.");
        return res.status(500).json({ error: "Server configuration error: API Key missing." });
    }

    // The entire payload (contents, systemInstruction, generationConfig) 
    // is passed securely from the front-end body
    const geminiPayload = req.body; 

    try {
        console.log("Proxying request to Gemini API...");
        
        const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload)
        });

        if (!response.ok) {
            // Forward the non-success status code and error details
            const errorText = await response.text();
            console.error(`Gemini API Error Status: ${response.status}`, errorText);
            return res.status(response.status).json({ 
                error: "Gemini API request failed", 
                details: errorText 
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("Error during API proxy:", error);
        res.status(500).json({ error: "Internal server error during API call." });
    }
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🔥 Gemini Proxy Server running on http://localhost:${PORT}`);
    console.log(`==================================================\n`);
    console.log(`Ready to handle requests at: POST http://localhost:${PORT}/api/generate-special`);
});