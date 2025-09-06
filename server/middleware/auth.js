import jwt from 'jsonwebtoken';
import { users } from '../data/users.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Get full user data
    const fullUser = users.find(u => u.id === user.id);
    if (!fullUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.user = fullUser;
    next();
  });
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const permissions = getPermissions(req.user.plan);
    
    if (!permissions[permission]) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        userPlan: req.user.plan
      });
    }

    next();
  };
};

export const getPermissions = (plan) => {
  const planPermissions = {
    'Gratuit': {
      canAccessDashboard: false,
      canExport: false,
      canAddAbsence: false,
      canImportEmployees: false,
      employeeLimit: 10,
    },
    'Pro': {
      canAccessDashboard: true,
      canExport: true,
      canAddAbsence: true,
      canImportEmployees: true,
      employeeLimit: 100,
    },
    'Pro Plus': {
      canAccessDashboard: true,
      canExport: true,
      canAddAbsence: true,
      canImportEmployees: true,
      employeeLimit: 300,
    },
  };
  
  return planPermissions[plan] || planPermissions['Gratuit'];
};