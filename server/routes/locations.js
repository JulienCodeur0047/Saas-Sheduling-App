import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { locations } from '../data/initialData.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all locations
router.get('/', authenticateToken, (req, res) => {
  try {
    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get location by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const location = locations.find(l => l.id === req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new location
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Location name is required' });
    }

    // Check if location already exists
    const existingLocation = locations.find(l => l.name.toLowerCase() === name.trim().toLowerCase());
    if (existingLocation) {
      return res.status(409).json({ error: 'Location with this name already exists' });
    }

    const newLocation = {
      id: uuidv4(),
      name: name.trim(),
      address: address?.trim() || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    locations.push(newLocation);
    res.status(201).json(newLocation);
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update location
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const locationIndex = locations.findIndex(l => l.id === req.params.id);
    if (locationIndex === -1) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { name, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Location name is required' });
    }

    // Check if another location with this name exists
    const existingLocation = locations.find(l => l.name.toLowerCase() === name.trim().toLowerCase() && l.id !== req.params.id);
    if (existingLocation) {
      return res.status(409).json({ error: 'Location with this name already exists' });
    }

    locations[locationIndex].name = name.trim();
    locations[locationIndex].address = address?.trim() || undefined;
    locations[locationIndex].updatedAt = new Date();

    res.json(locations[locationIndex]);
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete location
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const locationIndex = locations.findIndex(l => l.id === req.params.id);
    if (locationIndex === -1) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Note: In a real application, you should check if the location is being used
    // by any shifts before allowing deletion
    
    const deletedLocation = locations.splice(locationIndex, 1)[0];
    res.json({ message: 'Location deleted successfully', location: deletedLocation });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;