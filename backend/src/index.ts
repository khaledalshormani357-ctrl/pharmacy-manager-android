import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { addSale, getDashboardSummary, prescriptions, products, sales, users } from './store.js';
import { signToken, authenticateToken } from './auth.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'pharmacy-manager-backend' });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ id: user.id, role: user.role });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/dashboard', (_req: Request, res: Response) => {
  res.json({
    summary: getDashboardSummary(),
    products: products.slice(0, 50),
    alerts: products.filter((product) => product.stock < 10),
    recentSales: sales.slice(0, 20),
    prescriptions: prescriptions.slice(0, 20),
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

// Protect sales creation with authentication
app.post('/api/sales', authenticateToken, (req: Request, res: Response) => {
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

app.get('/api/users', authenticateToken, (_req: Request, res: Response) => {
  res.json(users.map(({ password, ...rest }) => rest));
});

app.listen(PORT, () => {
  console.log(`Pharmacy Manager Backend running on http://localhost:${PORT}`);
});
