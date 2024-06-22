const mongoose = require('mongoose')

const subTaskSchema = new mongoose.Schema(
    {
        task_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tasks'
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
)

const SubTask = mongoose.model('subtasks', subTaskSchema)
module.exports = SubTask