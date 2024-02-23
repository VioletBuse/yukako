import express from 'express';

const app = express();

app.all('*', (req, res) => {
    res.status(501).send('Not Implemented');
});

export default app;
