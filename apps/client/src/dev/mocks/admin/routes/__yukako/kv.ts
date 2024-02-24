import { Router } from 'express';

const kvRouter = Router();

kvRouter.use((req, res, next) => {
    res.status(501).send({ type: 'error', error: 'Unimplemented Kv Function' });
});

export default kvRouter;
