import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Bills API is running!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Suppliers routes
app.get('/suppliers/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

app.get('/suppliers', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

app.post('/suppliers', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(req.body)
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

app.get('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// Invoices routes
app.get('/invoices', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.post('/invoices', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert(req.body)
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

app.get('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// 404 handler (no wildcard)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    availableRoutes: [
      '/',
      '/suppliers',
      '/suppliers/health',
      '/invoices'
    ]
  });
});

export default app;
