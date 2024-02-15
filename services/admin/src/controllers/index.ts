import express, { NextFunction, Request, Response } from 'express';
import authRouter from './auth';
import projectsRouter from './projects';
import usersRouter from './users';
import versionsRouter from './versions';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { handleThrownError } from '../middleware/error-handling/throwable';
import { serve } from '../middleware/dashboard/serve';
import yukakoInternalApiRouter from './__yukako';
import morgan from 'morgan';
import kvRouter from './kv';

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('tiny'));

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/versions', versionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/kv', kvRouter);
app.use('/__yukako', yukakoInternalApiRouter);

app.use(serve());

app.use((req, res, next) => {
    res.status(404).send({ error: 'Not found' });
});

app.use(handleThrownError);

export default app;
