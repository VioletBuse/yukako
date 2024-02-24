import express from 'express';
import morgan from 'morgan';
import yukakoInternalRouter from './__yukako';

const app = express();

// app.use(morgan('tiny'));

app.use('/__yukako', yukakoInternalRouter);

app.use((req, res, next) => {
    res.status(501).send({ type: 'error', error: 'Not Implemented' });
});

export default app;
