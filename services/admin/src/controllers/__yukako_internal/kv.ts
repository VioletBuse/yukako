import { Router } from 'express';
import { respond } from '../../middleware/error-handling/throwable';

const kvRouter = Router();

kvRouter.get('/:kvId', (req, res) => {
    const kvid = req.params.kvId;
    const keys = req.query.keys;
    console.log('kvRouter.get /:kvId', kvid, keys);

    respond
        .status(200)
        .message({ value: 'this is a returned kv value' })
        .throw();
});

kvRouter.put('/:kvId', (req, res) => {
    const kvid = req.params.kvId;
    const list = req.query.list;
    console.log(
        'kvRouter.put /:kvId',
        kvid,
        Object.fromEntries(JSON.parse(list as string)),
    );

    respond.status(200).message({ success: true }).throw();
});

kvRouter.delete('/:kvId', (req, res) => {
    respond.status(200).message({ success: true }).throw();
});

export default kvRouter;
