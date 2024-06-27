const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['todo', 'inProgress', 'done'],
        default: 'todo',
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    AssignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    subTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubTask'
    }],
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;