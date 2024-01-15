const originalLog = console.log;

type LogData = {
    type: string;
    id: string;
    name: string;
};

export const rewriteLogging = (opts: LogData) => {
    console.log = (...args: any[]) => {
        const logData = {
            id: opts.id,
            type: opts.type,
            name: opts.name,
        };

        const str = JSON.stringify(logData);

        originalLog(
            `__START_YUKAKO_LOG_HEADER__${str}__END_YUKAKO_LOG_HEADER__`,
            ...args,
        );
    };
};
