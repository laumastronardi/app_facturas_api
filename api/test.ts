import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  console.log(`Test handler called: ${req.method} ${req.url}`);
  
  res.json({
    message: 'Test handler working!',
    method: req.method,
    url: req.url,
    path: req.path,
    originalUrl: req.originalUrl,
    headers: req.headers
  });
} 