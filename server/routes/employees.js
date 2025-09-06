import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { employees } from '../data/initialData.js';
import { authenticateToken, getPermissions } from '../middleware/auth.js';

const router = express.Router();

// Get all employees
router.get('/', authenticateToken, (req, res) => {
  try {
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const employee = employees.find(e => e.id === req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new employee
router.post('/', authenticateToken, (req, res) => {
  try {
    const permissions = getPermissions(req.user.plan);
    
    // Check employee limit
    if (employees.length >= permissions.employeeLimit) {
      return res.status(403).json({ 
        error: 'Employee limit reached',
        limit: permissions.employeeLimit
      });
    }

    const { name, email, role, phone, gender, avatarUrl } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    // Check if email already exists
    const existingEmployee = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (existingEmployee) {
      return res.status(409).json({ error: 'Employee with this email already exists' });
    }

    const newEmployee = {
      id: uuidv4(),
      name,
      email,
      role,
      phone: phone || '',
      gender: gender || 'Prefer not to say',
      avatarUrl: avatarUrl || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    employees.push(newEmployee);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const employeeIndex = employees.findIndex(e => e.id === req.params.id);
    if (employeeIndex === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { name, email, role, phone, gender, avatarUrl } = req.body;

    // Check if email is being changed and if it conflicts with another employee
    if (email && email !== employees[employeeIndex].email) {
      const existingEmployee = employees.find(e => e.email.toLowerCase() === email.toLowerCase() && e.id !== req.params.id);
      if (existingEmployee) {
        return res.status(409).json({ error: 'Employee with this email already exists' });
      }
    }

    // Update employee data
    if (name) employees[employeeIndex].name = name;
    if (email) employees[employeeIndex].email = email;
    if (role) employees[employeeIndex].role = role;
    if (phone !== undefined) employees[employeeIndex].phone = phone;
    if (gender) employees[employeeIndex].gender = gender;
    if (avatarUrl !== undefined) employees[employeeIndex].avatarUrl = avatarUrl;
    employees[employeeIndex].updatedAt = new Date();

    res.json(employees[employeeIndex]);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const employeeIndex = employees.findIndex(e => e.id === req.params.id);
    if (employeeIndex === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const deletedEmployee = employees.splice(employeeIndex, 1)[0];
    
    // Note: In a real application, you might want to also clean up related data
    // like shifts, absences, etc. or handle this with database cascading deletes
    
    res.json({ message: 'Employee deleted successfully', employee: deletedEmployee });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk import employees
router.post('/import', authenticateToken, (req, res) => {
  try {
    const permissions = getPermissions(req.user.plan);
    
    if (!permissions.canImportEmployees) {
      return res.status(403).json({ error: 'Import feature not available in your plan' });
    }

    const { employees: importData } = req.body;

    if (!Array.isArray(importData) || importData.length === 0) {
      return res.status(400).json({ error: 'Invalid import data' });
    }

    // Check employee limit
    if (employees.length + importData.length > permissions.employeeLimit) {
      return res.status(403).json({ 
        error: 'Import would exceed employee limit',
        limit: permissions.employeeLimit,
        current: employees.length,
        importing: importData.length
      });
    }

    const existingEmails = new Set(employees.map(e => e.email.toLowerCase()));
    const newEmployees = [];
    const skipped = [];

    for (const data of importData) {
      if (!data.name || !data.email) {
        skipped.push({ data, reason: 'Missing name or email' });
        continue;
      }

      if (existingEmails.has(data.email.toLowerCase())) {
        skipped.push({ data, reason: 'Email already exists' });
        continue;
      }

      const newEmployee = {
        id: uuidv4(),
        name: data.name,
        email: data.email,
        role: data.role || 'Unassigned',
        phone: data.phone || '',
        gender: data.gender || 'Prefer not to say',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      newEmployees.push(newEmployee);
      existingEmails.add(data.email.toLowerCase());
    }

    employees.push(...newEmployees);

    res.json({
      imported: newEmployees.length,
      skipped: skipped.length,
      employees: newEmployees,
      skippedItems: skipped
    });
  } catch (error) {
    console.error('Import employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;