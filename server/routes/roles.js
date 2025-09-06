import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { roles } from '../data/initialData.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all roles
router.get('/', authenticateToken, (req, res) => {
  try {
    res.json(roles);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get role by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const role = roles.find(r => r.id === req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new role
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    // Check if role already exists
    const existingRole = roles.find(r => r.name.toLowerCase() === name.trim().toLowerCase());
    if (existingRole) {
      return res.status(409).json({ error: 'Role with this name already exists' });
    }

    const newRole = {
      id: uuidv4(),
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    roles.push(newRole);
    res.status(201).json(newRole);
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update role
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const roleIndex = roles.findIndex(r => r.id === req.params.id);
    if (roleIndex === -1) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    // Check if another role with this name exists
    const existingRole = roles.find(r => r.name.toLowerCase() === name.trim().toLowerCase() && r.id !== req.params.id);
    if (existingRole) {
      return res.status(409).json({ error: 'Role with this name already exists' });
    }

    roles[roleIndex].name = name.trim();
    roles[roleIndex].updatedAt = new Date();

    res.json(roles[roleIndex]);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete role
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const roleIndex = roles.findIndex(r => r.id === req.params.id);
    if (roleIndex === -1) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Note: In a real application, you should check if the role is being used
    // by any employees before allowing deletion
    
    const deletedRole = roles.splice(roleIndex, 1)[0];
    res.json({ message: 'Role deleted successfully', role: deletedRole });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;