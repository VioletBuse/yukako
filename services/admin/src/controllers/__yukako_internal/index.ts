import { Router } from 'express';
import { getEnginePath } from '../../lib/get-engine-path';
import { respond } from '../../middleware/error-handling/throwable';

export const yukakoInternalApiRouter = Router();

yukakoInternalApiRouter.get('/', async (req, res) => {
    console.log('yukakoInternalApiRouter.get /');
    const enginePath = getEnginePath();

    respond.status(200).message({ enginePath }).throw();
});

export default yukakoInternalApiRouter;
