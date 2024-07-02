const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require("@apollo/server/express4");
const { authenticate } = require('./middlewares/authMiddleware')
const cookieParser = require('cookie-parser');
const context = require('./graphQL/context')
const rateLimit = require('express-rate-limit')

// Typedefs
const taskTypeDefs = require('./graphQL/typeDefs/taskTypeDefs')
const subtaskTypeDefts = require('./graphQL/typeDefs/subtaskTypeDefs')

// Resolvers
const taskResolvers = require('./graphQL/resolvers/taskResolvers')
const subtaskResolvers = require('./graphQL/resolvers/subtaskResolvers')

require('dotenv').config()

// Importing Routes
const userRoutes = require('./routes/userRoutes');

const __init__ = async () => {
    // To parse application/json
    app.use(express.json())

    // Setting up API rate limit
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.'
    });
    
    app.use(limiter);

    // CORS configuration for allowed origin
    app.use(cors({
        origin: `${process.env.CLIENT_URL}`,
        credentials: true // to set cookies on the client - JWT accessToken and refreshToken after sign in
    }));

    // For parsing cookies
    app.use(cookieParser());

    // Routing
    app.use('/user', userRoutes)

    // Setting up GraphQL server using Apollo Server
    const typeDefs = [ taskTypeDefs, subtaskTypeDefts ]
    const resolvers = [ taskResolvers, subtaskResolvers ]

    const graphQL = new ApolloServer({ 
        typeDefs, 
        resolvers,
    });
    await graphQL.start()
    // Routing the GraphQL server at route /graphql
    app.use("/graphql", authenticate, expressMiddleware(graphQL, { context }));

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
}

__init__()