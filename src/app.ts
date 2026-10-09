import express, {Application, Request, Response} from "express" ;
import { env } from "./config/env";

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const port = env.port;
 
export const app: Application = express();

app.use(express.json());


app.use(
'/api-docs',
swaggerUi.serve,
swaggerUi.setup(swaggerSpec)
);


