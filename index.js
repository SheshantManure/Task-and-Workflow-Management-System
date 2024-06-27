const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require("@apollo/server/express4");
const typeDefs = require('./graphQL/typeDefs')
const resolvers = require('./graphQL/resolvers')
require('dotenv').config()

// Importing Routes
const userRoutes = require('./routes/userRoutes');

const __init__ = async () => {
    // To parse application/json
    app.use(express.json())

    // CORS configuration for allowed origin
    app.use(cors({
        origin: `${process.env.CLIENT_URL}`,
        credentials: true // to set cookies
    }));

    app.use('/user', userRoutes)

    // Setting up GraphQL server using Apollo Server
    const graphQL = new ApolloServer({ typeDefs, resolvers });
    await graphQL.start()
    // Routing the GraphQL server at route /graphql
    app.use("/graphql", expressMiddleware(graphQL));

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