import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { shifts } from '../data/initialData.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all shifts
router.get('/', authenticateToken, (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    let filteredShifts = [...shifts];

    // Filter by date range
    if (startDate || endDate) {
      filteredShifts = filteredShifts.filter(shift => {
        const shiftDate = new Date(shift.startTime);
        if (startDate && shiftDate < new Date(startDate)) return false;
        if (endDate && shiftDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Filter by employee
    if (employeeId) {
      filteredShifts = filteredShifts.filter(shift => shift.employeeId === employeeId);
    }

    res.json(filteredShifts);
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get shift by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const shift = shifts.find(s => s.id === req.params.id);
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    res.json(shift);
  } catch (error) {
    console.error('Get shift error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new shift
router.post('/', authenticateToken, (req, res) => {
  try {
    const { employeeId, startTime, endTime, locationId, departmentId } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'Start time and end time are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const newShift = {
      id: uuidv4(),
      employeeId: employeeId || null,
      startTime: start,
      endTime: end,
      locationId: locationId || undefined,
      departmentId: departmentId || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    shifts.push(newShift);
    res.status(201).json(newShift);
  } catch (error) {
    console.error('Create shift error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update shift
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const shiftIndex = shifts.findIndex(s => s.id === req.params.id);
    if (shiftIndex === -1) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const { employeeId, startTime, endTime, locationId, departmentId } = req.body;

    // Validate times if provided
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (end <= start) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }
    }

    // Update shift data
    if (employeeId !== undefined) shifts[shiftIndex].employeeId = employeeId;
    if (startTime) shifts[shiftIndex].startTime = new Date(startTime);
    if (endTime) shifts[shiftIndex].endTime = new Date(endTime);
    if (locationId !== undefined) shifts[shiftIndex].locationId = locationId || undefined;
    if (departmentId !== undefined) shifts[shiftIndex].departmentId = departmentId || undefined;
    shifts[shiftIndex].updatedAt = new Date();

    res.json(shifts[shiftIndex]);
  } catch (error) {
    console.error('Update shift error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete shift
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const shiftIndex = shifts.findIndex(s => s.id === req.params.id);
    if (shiftIndex === -1) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const deletedShift = shifts.splice(shiftIndex, 1)[0];
    res.json({ message: 'Shift deleted successfully', shift: deletedShift });
  } catch (error) {
    console.error('Delete shift error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk delete shifts
router.delete('/', authenticateToken, (req, res) => {
  try {
    const { shiftIds } = req.body;

    if (!Array.isArray(shiftIds) || shiftIds.length === 0) {
      return res.status(400).json({ error: 'Shift IDs array is required' });
    }

    const deletedShifts = [];
    
    // Remove shifts in reverse order to maintain array indices
    for (let i = shifts.length - 1; i >= 0; i--) {
      if (shiftIds.includes(shifts[i].id)) {
        deletedShifts.push(shifts.splice(i, 1)[0]);
      }
    }

    res.json({ 
      message: `${deletedShifts.length} shifts deleted successfully`, 
      deletedShifts: deletedShifts.reverse() 
    });
  } catch (error) {
    console.error('Bulk delete shifts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk update shifts
router.put('/', authenticateToken, (req, res) => {
  try {
    const { shifts: updatedShifts } = req.body;

    if (!Array.isArray(updatedShifts)) {
      return res.status(400).json({ error: 'Shifts array is required' });
    }

    const results = [];

    for (const updatedShift of updatedShifts) {
      const shiftIndex = shifts.findIndex(s => s.id === updatedShift.id);
      if (shiftIndex !== -1) {
        // Validate times
        if (updatedShift.startTime && updatedShift.endTime) {
          const start = new Date(updatedShift.startTime);
          const end = new Date(updatedShift.endTime);
          if (end <= start) {
            continue; // Skip invalid shifts
          }
        }

        // Update the shift
        shifts[shiftIndex] = {
          ...shifts[shiftIndex],
          ...updatedShift,
          startTime: new Date(updatedShift.startTime),
          endTime: new Date(updatedShift.endTime),
          updatedAt: new Date()
        };
        results.push(shifts[shiftIndex]);
      }
    }

    res.json({ 
      message: `${results.length} shifts updated successfully`, 
      shifts: results 
    });
  } catch (error) {
    console.error('Bulk update shifts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;