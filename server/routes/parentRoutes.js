import express from 'express';
import Project from '../models/Project.js';
import { protect } from './userRoutes.js';

const router = express.Router();

// GET /parent/children (Get all children for the logged-in parent)
router.get('/children', protect, async (req, res) => {
    try {
        const children = await Project.find({ user: req.user._id }).sort({ updatedAt: -1 });
        // Map _id and ensure structure matches user request
        const formattedChildren = children.map(child => ({
            ...child.toObject(),
            id: child._id // Provide both if needed, or rely on _id
        }));
        res.json(formattedChildren);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching children', error: error.message });
    }
});

// POST /parent/children (Add a new child)
router.post('/children', protect, async (req, res) => {
    try {
        console.log('Adding new child:', req.body);
        const child = await Project.create({
            user: req.user._id,
            ...req.body
        });
        res.status(201).json({ ...child.toObject(), id: child._id });
    } catch (error) {
        res.status(400).json({ message: 'Invalid child data', error: error.message });
    }
});

// GET /parent/children/:id (Get child details)
router.get('/children/:id', protect, async (req, res) => {
    try {
        const child = await Project.findOne({ _id: req.params.id, user: req.user._id });
        if (child) {
            res.json({ ...child.toObject(), id: child._id });
        } else {
            res.status(404).json({ message: 'Child profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching child profile', error: error.message });
    }
});

// PUT /parent/children/:id (Update child details)
router.put('/children/:id', protect, async (req, res) => {
    try {
        const child = await Project.findOne({ _id: req.params.id, user: req.user._id });

        if (child) {
            Object.assign(child, req.body);
            const updatedChild = await child.save();
            res.json({ ...updatedChild.toObject(), id: updatedChild._id });
        } else {
            res.status(404).json({ message: 'Child profile not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating child profile', error: error.message });
    }
});

// DELETE /parent/children/:id (Delete child profile)
router.delete('/children/:id', protect, async (req, res) => {
    try {
        const child = await Project.findOne({ _id: req.params.id, user: req.user._id });

        if (child) {
            await child.deleteOne();
            res.json({ message: 'Child profile removed' });
        } else {
            res.status(404).json({ message: 'Child profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting child profile', error: error.message });
    }
});

export default router;
