import express from 'express';
import Project from '../models/Project.js';
import { protect } from './userRoutes.js';

const router = express.Router();

// GET /projects
router.get('/', protect, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id }).sort({ updatedAt: -1 });
        // Map _id to id for frontend compatibility
        const formattedProjects = projects.map(p => ({
            ...p.toObject(),
            id: p._id
        }));
        res.json(formattedProjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
});

// POST /projects
router.post('/', protect, async (req, res) => {
    try {
        const project = await Project.create({
            user: req.user._id,
            ...req.body
        });
        res.status(201).json({ ...project.toObject(), id: project._id });
    } catch (error) {
        res.status(400).json({ message: 'Invalid project data', error: error.message });
    }
});

// GET /projects/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
        if (project) {
            res.json({ ...project.toObject(), id: project._id });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project', error: error.message });
    }
});

// PUT /projects/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user._id });

        if (project) {
            // Update fields
            Object.assign(project, req.body);
            const updatedProject = await project.save();
            res.json({ ...updatedProject.toObject(), id: updatedProject._id });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating project', error: error.message });
    }
});

// DELETE /projects/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user._id });

        if (project) {
            await project.deleteOne();
            res.json({ message: 'Project removed' });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
});

// POST /projects/analysis
router.post('/analysis', protect, async (req, res) => {
    try {
        const {
            studentName,
            studentAge,
            gradeLevel,
            presentLevels,
            currentPerformance,
            goals,
            accommodations,
            relatedServices,
            projectId
        } = req.body;

        console.log('--- Analysis Request Inputs ---');
        console.log(req.body);

        // Mock AI Generation Logic
        // In a real app, this would call OpenAI or similar.
        const analysisText = `
### Comprehensive Student Analysis for ${studentName}

**Project Reference**: ${projectId || 'New Project'}

**Overview**
${studentName} (Age: ${studentAge || 'N/A'}) is currently in ${gradeLevel}. Based on the provided data, they demonstrate specific strengths and needs that guide this educational plan.

**Present Levels Summary**
${presentLevels || 'Data implies a need for detailed observation.'}

**Current Performance**
${currentPerformance || 'Performance details not provided.'}

**Goal Alignment**
The goals outlined ("${goals || 'Pending'}") appear well-aligned with their current performance levels.

**Accommodations & Services**
Recommended accommodations: ${accommodations || 'None specified'}.
Related Services: ${relatedServices && relatedServices.length > 0 ? relatedServices.join(', ') : 'None specified'}.

**Recommendations**
- Continue monitoring progress weekly.
- Ensure accommodations are applied consistently across all environments.
      `.trim();

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('--- Generated Analysis ---');
        console.log(analysisText);

        res.json({ analysis: analysisText });

    } catch (error) {
        res.status(500).json({ message: 'Analysis generation failed', error: error.message });
    }
});

export default router;
