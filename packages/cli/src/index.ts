import meow from 'meow';

type Result = {
    postgres: {
        url: string;
        readonlyUrl?: string;
        anyUrl: string;
    };
    adminHost: string;
    port: number;
    secret: string;
};

export const run = (): Result => {
    const cli = meow(
        `
	Usage
	$ yukako

	Options
	--postgres, -p  Postgres connection string, defaults to $POSTGRES_URL
	--postgres-ro, -r  Postgres read-only connection string
	--admin-host, -a  Admin host, defaults to localhost
	--secret, -s Secret for authenticating other cluster members
	--help, -h  Show help
`,
        {
            importMeta: import.meta,
            flags: {
                postgres: {
                    type: 'string',
                    shortFlag: 'pg',
                    default:
                        process.env.POSTGRES_URL ||
                        'postgres://postgres:postgres@localhost:5432/postgres',
                },
                postgresRo: {
                    type: 'string',
                    shortFlag: 'r',
                    default:
                        process.env.POSTGRES_RO_URL ||
                        'postgres://postgres:postgres@localhost:5432/postgres',
                },
                adminHost: {
                    type: 'string',
                    shortFlag: 'a',
                    default: 'localhost',
                },
                secret: {
                    type: 'string',
                    shortFlag: 's',
                    default: process.env.YUKAKO_SECRET || '',
                },
                port: {
                    type: 'number',
                    shortFlag: 'p',
                    default: 8080,
                },
                help: {
                    type: 'boolean',
                    shortFlag: 'h',
                    default: false,
                },
            },
        },
    );

    if (cli.flags.help) {
        cli.showHelp();
        process.exit(0);
    }

    return {
        postgres: {
            url: cli.flags.postgres,
            readonlyUrl: cli.flags.postgresRo,
            anyUrl: cli.flags.postgresRo || cli.flags.postgres,
        },
        adminHost: cli.flags.adminHost,
        port: cli.flags.port,
        secret: cli.flags.secret,
    };
};
