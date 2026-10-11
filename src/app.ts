import express, { Application, NextFunction, Request, Response } from "express";
import userRoutes from './routes/users';
import depositRoutes from './routes/deposits';
import fundRoutes from './routes/funds';
import dreamRoutes from './routes/dreams';
import { loggerMiddleware } from "./middleware/logger.middleware";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

export const app: Application = express();

app.use(express.json());
app.use(loggerMiddleware);

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/deposits', depositRoutes);
app.use('/api/v1/funds', fundRoutes);
app.use('/api/v1/dreams', dreamRoutes);

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((error: { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (error.type === 'entity.parse.failed') {
        res.status(400).json({ message: 'Malformed JSON in request body' });
        return;
    }
    console.error(error);
    res.status(error.status ?? 500).json({ message: 'Internal server error' });
});
