const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        username: { 
            type: String,
            required: true
        },
        email: { 
            type: String,
            required: true, 
            unique: true 
        },
        password: { 
            type: String, 
            required: true, 
            minlength: 8 
        },
        role: { 
            type: String, 
            required: true, 
            enum: ['admin', 'project manager', 'team lead', 'member'], 
            default: 'member'
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', userSchema)
module.exports = User