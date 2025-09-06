import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { departments } from '../data/initialData.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all departments
router.get('/', authenticateToken, (req, res) => {
  try {
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new department
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const existingDepartment = departments.find(d => d.name.toLowerCase() === name.trim().toLowerCase());
    if (existingDepartment) {
      return res.status(409).json({ error: 'Department with this name already exists' });
    }

    const newDepartment = {
      id: uuidv4(),
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    departments.push(newDepartment);
    res.status(201).json(newDepartment);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update department
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const departmentIndex = departments.findIndex(d => d.id === req.params.id);
    if (departmentIndex === -1) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const existingDepartment = departments.find(d => d.name.toLowerCase() === name.trim().toLowerCase() && d.id !== req.params.id);
    if (existingDepartment) {
      return res.status(409).json({ error: 'Department with this name already exists' });
    }

    departments[departmentIndex].name = name.trim();
    departments[departmentIndex].updatedAt = new Date();

    res.json(departments[departmentIndex]);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete department
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const departmentIndex = departments.findIndex(d => d.id === req.params.id);
    if (departmentIndex === -1) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const deletedDepartment = departments.splice(departmentIndex, 1)[0];
    res.json({ message: 'Department deleted successfully', department: deletedDepartment });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;