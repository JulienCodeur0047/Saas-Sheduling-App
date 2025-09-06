import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { users, subscriptions, payments } from '../data/users.js';
import { authenticateToken, getPermissions } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    const permissions = getPermissions(user.plan);

    res.json({
      user: userWithoutPassword,
      token,
      permissions
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, plan, businessType, companyName, activitySector, address } = req.body;

    if (!name || !email || !password || !plan || !businessType || !companyName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      plan,
      avatarUrl: null,
      businessType,
      companyName,
      activitySector,
      address,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);

    // Create subscription if not free plan
    if (plan !== 'Gratuit') {
      const subscription = {
        userId: newUser.id,
        plan,
        startDate: new Date(),
        nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: 'active'
      };
      subscriptions.push(subscription);
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...userWithoutPassword } = newUser;
    const permissions = getPermissions(newUser.plan);

    res.status(201).json({
      user: userWithoutPassword,
      token,
      permissions
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;
    const permissions = getPermissions(req.user.plan);
    
    // Get subscription and payment history
    const subscription = subscriptions.find(s => s.userId === req.user.id);
    const paymentHistory = payments.filter(p => p.userId === req.user.id);

    res.json({
      user: userWithoutPassword,
      permissions,
      subscription,
      paymentHistory
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, avatarUrl, companyName, address } = req.body;
    
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    if (name) users[userIndex].name = name;
    if (avatarUrl !== undefined) users[userIndex].avatarUrl = avatarUrl;
    if (companyName) users[userIndex].companyName = companyName;
    if (address !== undefined) users[userIndex].address = address;
    users[userIndex].updatedAt = new Date();

    const { password: _, ...userWithoutPassword } = users[userIndex];
    
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  const permissions = getPermissions(req.user.plan);
  
  res.json({
    user: userWithoutPassword,
    permissions
  });
});

export default router;