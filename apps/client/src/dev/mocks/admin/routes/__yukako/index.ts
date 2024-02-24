import { Router } from 'express';
import kvRouter from './kv';

const yukakoInternalRouter = Router();

yukakoInternalRouter.use('/kv', kvRouter);

export default yukakoInternalRouter;
