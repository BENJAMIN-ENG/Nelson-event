import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import connectDB from './db/connect.js';
import locationRoutes from './src/location/locationRoutes.js';
import userRoutes from './src/user/userRoutes.js';
import swaggerSpec from './config/swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Routes
app.use('/api/location', locationRoutes);
app.use('/api/user', userRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
