import { Router } from 'express';
import { respond } from '../../middleware/error-handling/throwable';

const kvRouter = Router();

kvRouter.get('/:kvId/:kvKey', (req, res) => {
    console.log('kvRouter.get /:kvId');
    console.log('req.params.kvId', req.params.kvId);
    console.log('req.params.kvKey', req.params.kvKey);

    respond
        .status(200)
        .message({ value: 'this is a returned kv value' })
        .throw();
});

kvRouter.put('/:kvId/:kvKey', (req, res) => {
    console.log('kvRouter.put /:kvId');
    console.log('req.params.kvId', req.params.kvId);
    console.log('req.params.kvKey', req.params.kvKey);

    respond.status(200).message({ success: true }).throw();
});

kvRouter.delete('/:kvId/:kvKey', (req, res) => {
    console.log('kvRouter.delete /:kvId');
    console.log('req.params.kvId', req.params.kvId);
    console.log('req.params.kvKey', req.params.kvKey);

    respond.status(200).message({ success: true }).throw();
});

export default kvRouter;
