import express, { type Request, type Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { signToken, authenticateToken } from './auth.js';
import { prisma } from './db.js';
import { seed } from './seed.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

// Seed database on startup (only if empty)
seed().catch((e) => console.error('Seeding failed', e));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'pharmacy-manager-backend' });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken({ id: user.id, role: user.role });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/dashboard', async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({ take: 50 });
  const alerts = await prisma.product.findMany({ where: { stock: { lt: 10 } } });
  const recentSales = await prisma.sale.findMany({ orderBy: { soldAt: 'desc' }, take: 20 });
  const prescriptions = await prisma.prescription.findMany({ take: 20 });

  const totalProducts = await prisma.product.count();
  const lowStockProducts = await prisma.product.count({ where: { stock: { lt: 10 } } });
  const salesToday = await prisma.sale.count();
  const revenueAgg = await prisma.sale.aggregate({ _sum: { total: true } });
  const revenueToday = revenueAgg._sum.total || 0;

  res.json({ summary: { totalProducts, lowStockProducts, salesToday, revenueToday, pendingPrescriptions: prescriptions.filter((p) => p.status === 'pending').length }, products, alerts, recentSales, prescriptions });
});

app.get('/api/products', async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(products);
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.json(product);
});

app.post('/api/sales', authenticateToken, async (req: Request, res: Response) => {
  const { productId, quantity, cashier, prescriptionRequired } = req.body;
  if (!productId || !quantity || !cashier) return res.status(400).json({ message: 'productId, quantity, and cashier are required' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');
      if (product.stock < Number(quantity)) throw new Error('Not enough stock');

      const total = Number(product.unitPrice) * Number(quantity);
      const sale = await tx.sale.create({ data: { productId, quantity: Number(quantity), total, cashier, prescriptionRequired: Boolean(prescriptionRequired) } });
      await tx.product.update({ where: { id: productId }, data: { stock: product.stock - Number(quantity), status: product.stock - Number(quantity) < 10 ? 'low-stock' : 'active' } });
      return sale;
    });

    return res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to create sale';
    return res.status(400).json({ message });
  }
});

app.get('/api/sales', async (_req: Request, res: Response) => {
  const sales = await prisma.sale.findMany({ orderBy: { soldAt: 'desc' } });
  res.json(sales);
});

app.get('/api/alerts', async (_req: Request, res: Response) => {
  const alerts = await prisma.product.findMany({ where: { stock: { lt: 10 } } });
  res.json(alerts);
});

app.get('/api/prescriptions', async (_req: Request, res: Response) => {
  const prescriptions = await prisma.prescription.findMany({ orderBy: { issuedAt: 'desc' } });
  res.json(prescriptions);
});

app.get('/api/users', authenticateToken, async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Pharmacy Manager Backend running on http://localhost:${PORT}`);
});
