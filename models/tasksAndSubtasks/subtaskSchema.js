const mongoose = require('mongoose');

const subTaskSchema = new mongoose.Schema({
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['todo', 'inProgress', 'done'],
        default: 'todo',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const SubTask = mongoose.model('SubTask', subTaskSchema);
module.exports = SubTask;