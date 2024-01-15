import express, { NextFunction, Request, Response } from 'express';
import authRouter from './auth';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {
    handleThrownError,
    respond,
} from '../middleware/error-handling/throwable';
import projectsRouter from './projects';

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/projects', projectsRouter);

app.use((req, res, next) => {
    res.status(404).send({ error: 'Not found' });
});

app.use(handleThrownError);

export default app;
