// import os for cpu count
import os from 'os';

const getArg = (long: string, short: string): string | null => {
    const basicIndexLong = process.argv.indexOf(long);
    const basicIndexShort = process.argv.indexOf(short);

    const basicIndex = basicIndexLong !== -1 ? basicIndexLong : basicIndexShort;

    if (basicIndex !== -1) {
        const value = process.argv[basicIndex + 1];

        if (value) {
            return value;
        } else {
            return null;
        }
    }

    const withEqualIndexLong = process.argv.indexOf(`${long}=`);
    const withEqualIndexShort = process.argv.indexOf(`${short}=`);

    const withEqualIndex =
        withEqualIndexLong !== -1 ? withEqualIndexLong : withEqualIndexShort;

    if (withEqualIndex !== -1) {
        const [_, ...value] = process.argv[withEqualIndex].split('=');

        if (value) {
            return value.join('=');
        } else {
            return null;
        }
    }

    return null;
};

type Result = {
    postgres: {
        url: string;
        readonlyUrl?: string;
        anyUrl: string;
    };
    adminHost: string;
    port: number;
    secret: string;
    workerCount: number;
};

const helptext = `
	$ yukako [options]

	Options:
		--postgres, -p,		Postgres URL, $YUKAKO_POSTGRES_URL, defaults to postgres://postgres:postgres@localhost:5432/postgres
		--postgres-ro, -r	Postgres read-only URL, $YUKAKO_POSTGRES_RO_URL, defaults to rw URL
		--admin-host, -a	Admin api/dashboard host, $YUKAKO_ADMIN_HOST, defaults to localhost
		--port, -o			Port, $YUKAKO_PORT, defaults to 8080
		--secret, -s		Secret, $YUKAKO_SECRET, defaults to 'secret'
		--cluster, -c 		Number of cluster workers, $YUKAKO_CLUSTER either a number, or 'auto' to use the number of CPU cores, defaults to 1

	Examples:
		$ yukako --postgres postgres://postgres:postgres@localhost:5432/postgres --admin-host localhost --port 8080 --secret secret
		$ yukako -a 'admin.localhost'
`;

const postgresProtocols = ['postgres:', 'postgresql:', 'postgresql+ssl:'];

export const run = (): Result => {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(helptext);
        process.exit(0);
    }

    // console.log('args', args);

    const postgresArg = getArg('--postgres', '-p');
    const roPostgresArg = getArg('--postgres-ro', '-r');

    const adminHostArg = getArg('--admin-host', '-a');
    const portArg = getArg('--port', '-o');

    const secretArg = getArg('--secret', '-s');

    const clusterArg = getArg('--cluster', '-c');

    const postgres =
        postgresArg ||
        process.env.YUKAKO_POSTGRES_URL ||
        'postgres://postgres:postgres@localhost:5432/postgres';
    const readonlyUrl =
        roPostgresArg || process.env.YUKAKO_POSTGRES_RO_URL || postgres;
    const anyPostgres = roPostgresArg || postgresArg || postgres;

    const adminHost =
        adminHostArg || process.env.YUKAKO_ADMIN_HOST || 'localhost';
    const port = portArg || process.env.YUKAKO_PORT || '8080';

    const cluster = clusterArg || process.env.YUKAKO_CLUSTER || '1';

    if (isNaN(parseInt(port))) {
        console.error('Port must be a number');
        console.error(helptext);

        process.exit(1);
    }

    if (!postgresProtocols.includes(new URL(postgres).protocol)) {
        console.error(
            'Postgres URL must start with postgres:// or postgresql://',
        );
        console.error(helptext);

        process.exit(1);
    }

    if (!postgresProtocols.includes(new URL(readonlyUrl).protocol)) {
        console.error(
            'Postgres read-only URL must start with postgres:// or postgresql://',
        );
        console.error(helptext);

        process.exit(1);
    }

    if (isNaN(parseInt(cluster)) && cluster !== 'auto') {
        console.error('Cluster must be a number or "auto"');
        console.error(helptext);

        process.exit(1);
    }

    const secret = secretArg || process.env.YUKAKO_SECRET || 'secret';
    const clusterWorkerCount =
        cluster === 'auto' ? os.cpus().length : parseInt(cluster);

    return {
        postgres: {
            url: postgres,
            readonlyUrl,
            anyUrl: anyPostgres,
        },
        adminHost,
        port: parseInt(port),
        secret,
        workerCount: clusterWorkerCount,
    };
};
