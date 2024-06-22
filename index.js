const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()

app.use(express.json())

// Importing Routes
const userRoutes = require('./routes/userRoutes')

app.use('/user', userRoutes)

// Centralized error handling middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'An unexpected error occurred.'
        }
    });
});

// Upon successful connection with MongoDB, we'll make the server live
mongoose.connect(process.env.MONGO_DB_URI)
.then(() => {
    app.listen(process.env.PORT, () => { 
        console.log(`Server live at port ${process.env.PORT}`);
    });
    console.log('MongoDB connected successfully.')
})
.catch(err => console.error('MongoDB connection error:', err));