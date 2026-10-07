import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parsePort(): number {
  // If explicitly passed via CLI argument --port <port>
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed)) return parsed;
  }
  // If APP_PORT is explicitly set in environment
  if (process.env.APP_PORT) {
    const parsed = parseInt(process.env.APP_PORT, 10);
    if (!isNaN(parsed)) return parsed;
  }
  // In AI Studio / Cloud Run, PORT=8080 is the ingress proxy (Nginx).
  // The Node application must always run on port 3000 to match Nginx's proxy_pass.
  if (process.env.PORT && process.env.PORT !== '8080') {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 3000;
}

async function startServer() {
  const app = express();
  const PORT = parsePort();
  const isProd = process.env.NODE_ENV === 'production';

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server error:', err);
  });

  process.on('SIGTERM', () => {
    server.close();
  });
  process.on('SIGINT', () => {
    server.close();
  });

  app.use(express.json({ limit: '20mb' }));

  // API Route: Dissect clothing items from outfit image using Gemini Vision
  app.post('/api/dissect-image', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(200).json({
          status: 'fallback',
          message: 'No GEMINI_API_KEY found, using client fallback analysis',
          dissectedItems: null,
        });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

      const { GoogleGenAI, Type } = await import('@google/genai');

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            text: `You are an expert fashion AI visual analyst. Dissect this outfit image into individual clothing items and accessories.
For each item found (e.g. top, outerwear, bottoms, footwear, headwear, bag, jewelry/accessory):
1. Identify item name, specific category (Tops, Outerwear, Bottoms, Footwear, Accessories, Knitwear, Dresses).
2. Primary and secondary colors.
3. Aesthetic style (e.g., Gorpcore, Minimalist, Streetwear, Avant-Garde, Quiet Luxury, Vintage, Y2K, Workwear).
4. Silhouette / fit (e.g. oversized, boxy, relaxed, cropped, slim, wide-leg).
5. Material/fabric (e.g. mohair, denim, nylon gore-tex, heavy cotton, leather, wool).
6. Estimated bounding box or relative placement [ymin, xmin, ymax, xmax] normalized 0-100.
7. Concise search query keywords to find similar items in an e-commerce marketplace.
8. Style tags (array of 3-5 strings).

Provide realistic, accurate fashion analysis. Return valid JSON matching the schema.`,
          },
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallAesthetic: {
                type: Type.STRING,
                description: 'The overall outfit aesthetic (e.g. Minimalist Streetwear, Gorpcore, etc.)',
              },
              colorPalette: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Dominant colors in the outfit',
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    color: { type: Type.STRING },
                    material: { type: Type.STRING },
                    aesthetic: { type: Type.STRING },
                    fit: { type: Type.STRING },
                    searchKeywords: { type: Type.STRING },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    box: {
                      type: Type.OBJECT,
                      properties: {
                        ymin: { type: Type.NUMBER },
                        xmin: { type: Type.NUMBER },
                        ymax: { type: Type.NUMBER },
                        xmax: { type: Type.NUMBER },
                      },
                    },
                  },
                  required: ['name', 'category', 'color', 'aesthetic', 'tags'],
                },
              },
            },
            required: ['overallAesthetic', 'colorPalette', 'items'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini');
      }

      const parsedData = JSON.parse(responseText);
      return res.json({
        status: 'success',
        data: parsedData,
      });
    } catch (err: any) {
      console.error('Gemini dissection error:', err);
      return res.status(200).json({
        status: 'fallback',
        error: err.message,
        dissectedItems: null,
      });
    }
  });

  // Health check endpoints
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', app: 'Aesthro' });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  if (!isProd) {
    const vitePromise = createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (e) {
        next(e);
      }
    });

    vitePromise
      .then(() => {
        console.log('  ➜  Vite middleware ready in SPA mode');
      })
      .catch((err) => {
        console.error('Failed to initialize Vite middleware:', err);
      });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
