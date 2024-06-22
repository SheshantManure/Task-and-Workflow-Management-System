const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
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
            enum: ['created', 'assigned', 'ongoing', 'finished'],
            default: 'created',
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId
        },
        createdBy: {
            user_id: { 
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'users'
            },
            username: {
                type: String,
                required: true,
            },
            role: { 
                type: String,
                enum: ['admin', 'project_manager'], 
                required: true,
            }
        },
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model('tasks', taskSchema);
module.exports = Task;