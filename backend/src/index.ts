import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { addSale, getDashboardSummary, prescriptions, products, sales, users } from './store.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'pharmacy-manager-backend' });
});

app.get('/api/dashboard', (_req: Request, res: Response) => {
  res.json({
    summary: getDashboardSummary(),
    products: products.slice(0, 5),
    alerts: products.filter((product) => product.stock < 10),
    recentSales: sales.slice(0, 5),
    prescriptions: prescriptions.slice(0, 5),
  });
});

app.get('/api/products', (_req: Request, res: Response) => {
  res.json(products);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json(product);
});

app.post('/api/sales', (req: Request, res: Response) => {
  const { productId, quantity, cashier, prescriptionRequired } = req.body;

  if (!productId || !quantity || !cashier) {
    return res.status(400).json({ message: 'productId, quantity, and cashier are required' });
  }

  try {
    const sale = addSale(productId, Number(quantity), cashier, Boolean(prescriptionRequired));
    return res.status(201).json(sale);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create sale';
    return res.status(400).json({ message });
  }
});

app.get('/api/sales', (_req: Request, res: Response) => {
  res.json(sales);
});

app.get('/api/alerts', (_req: Request, res: Response) => {
  res.json(products.filter((product) => product.stock < 10));
});

app.get('/api/prescriptions', (_req: Request, res: Response) => {
  res.json(prescriptions);
});

app.get('/api/users', (_req: Request, res: Response) => {
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Pharmacy Manager Backend running on http://localhost:${PORT}`);
});
