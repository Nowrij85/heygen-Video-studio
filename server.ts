import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import dotenv from 'dotenv';
import multer from 'multer';
import FormData from 'form-data';

dotenv.config();

const upload = multer();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy for HeyGen API to avoid CORS issues
  app.all('/api/heygen/*', upload.single('file'), async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    // Use req.params[0] to get the path after /api/heygen/
    const subPath = req.params[0] || '';

    if (!apiKey) {
      return res.status(401).json({ error: { message: 'API Key is required' } });
    }

    try {
      // Ensure we don't have leading slashes and handle the path correctly
      const cleanPath = subPath.replace(/^\/+/, '');
      const url = `https://api.heygen.com/${cleanPath}`;
      console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${url}`);
      
      let data = req.body;
      let headers: any = {
        'X-Api-Key': apiKey as string,
        'Accept': 'application/json',
      };

      // Handle multipart/form-data for uploads
      if (req.file) {
        const form = new FormData();
        form.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });
        data = form;
        headers = { ...headers, ...form.getHeaders() };
      } else if (req.method !== 'GET' && req.method !== 'HEAD') {
        headers['Content-Type'] = 'application/json';
      }

      const response = await axios({
        method: req.method,
        url,
        headers,
        data: (req.method === 'GET' || req.method === 'HEAD') ? undefined : data,
        params: Object.keys(req.query).length > 0 ? req.query : undefined,
      });

      console.log(`[Proxy Success] ${response.status} for ${url}`);
      res.status(response.status).json(response.data);
    } catch (error: any) {
      const status = error.response?.status || 500;
      let errorData = error.response?.data;
      const url = `https://api.heygen.com/${subPath.replace(/^\/+/, '')}`;
      
      // If the error data is HTML, don't send it back as JSON
      if (typeof errorData === 'string' && errorData.includes('<!DOCTYPE')) {
        console.error(`[Proxy Error] Received HTML instead of JSON from HeyGen (${status}) for ${req.method} ${url}`);
        errorData = { error: { message: `HeyGen returned an HTML error page (Status ${status}). This usually means the API endpoint path is incorrect or the service is down. URL: ${url}` } };
      } else {
        console.error(`[Proxy Error] ${status} for ${url}:`, errorData || error.message);
      }

      res.status(status).json(errorData || { error: { message: error.message } });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
