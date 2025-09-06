import bcrypt from 'bcryptjs';

// In-memory user storage (in production, this would be a database)
export const users = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@quickshift.com',
    password: bcrypt.hashSync('admin123', 10), // In production, use proper password hashing
    plan: 'Pro Plus',
    avatarUrl: null,
    businessType: 'Company',
    companyName: 'Quick Shift Inc.',
    activitySector: 'Technology',
    address: '123 Tech Lane, CA',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  }
];

export const subscriptions = [
  {
    userId: 'user-1',
    plan: 'Pro Plus',
    startDate: new Date('2023-01-15'),
    nextPaymentDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15),
    renewalDate: new Date(new Date().getFullYear() + 1, 0, 15),
    status: 'active'
  }
];

export const payments = [
  { id: 'pay-1', userId: 'user-1', date: new Date(new Date().setMonth(new Date().getMonth() - 1)), amount: 20, plan: 'Pro Plus', status: 'Paid' },
  { id: 'pay-2', userId: 'user-1', date: new Date(new Date().setMonth(new Date().getMonth() - 2)), amount: 20, plan: 'Pro Plus', status: 'Paid' },
  { id: 'pay-3', userId: 'user-1', date: new Date(new Date().setMonth(new Date().getMonth() - 3)), amount: 20, plan: 'Pro Plus', status: 'Paid' },
  { id: 'pay-4', userId: 'user-1', date: new Date(new Date().setMonth(new Date().getMonth() - 4)), amount: 20, plan: 'Pro Plus', status: 'Paid' },
];