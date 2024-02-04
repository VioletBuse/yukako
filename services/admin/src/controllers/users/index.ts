import { Router } from 'express';
import { respond } from '../../middleware/error-handling/throwable';
import { ZodError } from 'zod';
import { getDatabase } from '@yukako/state';
import { authenticate } from '../../lib/authenticate';
import { UsersUserDataResponseBodyType } from '@yukako/types';

const usersRouter = Router();

usersRouter.get('/', async (req, res) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        const usersData = await db.query.users.findMany({
            with: {
                createdNewUserTokens: {
                    with: {
                        newUser: true,
                    },
                },
                createdFromToken: {
                    with: {
                        createdBy: true,
                    },
                },
            },
        });

        const data: UsersUserDataResponseBodyType[] = usersData.map(
            (user): UsersUserDataResponseBodyType => {
                const invitees = user.createdNewUserTokens
                    .filter((token) => token.newUser !== null)
                    .map((token) => ({
                        uid: token.newUser!.id,
                        username: token.newUser!.username,
                    }));

                let invitedBy = null;

                if (user.createdFromToken) {
                    invitedBy = {
                        uid: user.createdFromToken.createdBy.id,
                        username: user.createdFromToken.createdBy.username,
                    };
                }

                const timestamp: number = user.createdAt.getTime();

                return {
                    uid: user.id,
                    username: user.username,
                    invitedBy,
                    invitees,
                    createdAt: timestamp,
                };
            },
        );

        respond.status(200).message(data).throw();
    } catch (e) {
        respond.rethrow(e);

        if (e instanceof ZodError) {
            respond
                .status(400)
                .message({ error: 'Invalid request body.' })
                .throw();
            return;
        }

        console.error(e);

        respond.status(500).message({ error: 'Internal server error' }).throw();
    }
});

export default usersRouter;
