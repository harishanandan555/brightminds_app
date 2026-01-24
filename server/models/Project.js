import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    studentName: {
        type: String,
        required: true,
    },
    studentAge: {
        type: Number,
        required: true,
    },
    gradeLevel: {
        type: String,
        required: true,
    },


    presentLevels: String,
    currentPerformance: String,
    goals: String,
    accommodations: String,
    parentSurvey: String,
    notes: String,
    relatedServices: [String],
    analysis: String,
    documents: [{
        name: String,
        size: Number,
        type: String,
        lastModified: Number,
    }],
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
