import express from 'express';

import bodyParser from 'body-parser';
import cors from 'cors';

import { sequelize } from './sequelize';

import { config } from './config';

import { IndexRouter } from './router';

import { User } from './models/User';

(async() => {
    // Add models
    sequelize.addModels([User]);
    
    // Sync database
    await sequelize.sync();
    
    // Create new express app instance
    const app: express.Application = express();

    app.use(bodyParser.json());

    app.use(cors({
        allowedHeaders: [
          'Origin', 'X-Requested-With',
          'Content-Type', 'Accept',
          'X-Access-Token', 'Authorization',
        ],
        methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
        origin: config.url,
    }));

    app.use('/api/v0/users/', IndexRouter);
    
    app.get('/api/v0/', (req, res) => {
        res.send('Hello From User Microservice!');
    });
    
    app.get('/api/', (req, res) => {
        res.send('Hello From User Microservice!');
    });
    
    app.get('/', (req, res) => {
        res.send('Hello From User Microservice!');
    });

    // Start the server
    app.listen(8080, () => {
        console.log('User service is running on port 8080!');
    });
})();