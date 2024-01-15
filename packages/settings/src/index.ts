import * as path from 'path';

type YukakoConfigurationOptions = {
    data_dir?: string;
    leaderWsAddr?: string;
};

type LeaderConfig = {
    dataDir: string;
    wsAddr: string;
};

type LeaderConfigEnv = {
    LEADER_DATA_DIR: string;
    LEADER_WS_ADDR: string;
};

type EngineConfig = {
    dataDir: string;
    leaderWsAddr: string;
};

type EngineConfigEnv = {
    ENGINE_DATA_DIR: string;
    ENGINE_LEADER_WS_ADDR: string;
};

type AdminConfig = {
    dataDir: string;
    leaderWsAddr: string;
};

type AdminConfigEnv = {
    ADMIN_DATA_DIR: string;
    ADMIN_LEADER_WS_ADDR: string;
};

type ProxyConfig = {
    dataDir: string;
    leaderWsAddr: string;
};

type ProxyConfigEnv = {
    PROXY_DATA_DIR: string;
    PROXY_LEADER_WS_ADDR: string;
};

type AssertEnvExists = (val: unknown, name: string) => asserts val is string;

const assertEnvExists: AssertEnvExists = (val, name) => {
    if (!val || typeof val !== 'string') {
        throw new Error(`Env var ${name} is not defined`);
    } else {
        return;
    }
};

export class YukakoConfiguration {
    readonly _data_dir: string = path.resolve(process.cwd(), './.yukako/');
    readonly _leaderWsSocketAddrDNU: string = './leader.sock';

    constructor(opts?: YukakoConfigurationOptions) {
        if (opts?.data_dir) {
            this._data_dir = path.resolve(process.cwd(), opts.data_dir);
        }

        if (opts?.leaderWsAddr) {
            this._leaderWsSocketAddrDNU = opts.leaderWsAddr;
        }
    }

    private leaderWsSocketPath(): string {
        return path.resolve(this._data_dir, this._leaderWsSocketAddrDNU);
    }

    static processesToRun(): {
        leader: boolean;
        engine: boolean;
        admin: boolean;
        proxy: boolean;
    } {
        const runLeaderEnv = process.env.YUKAKO_RUN_LEADER;
        const runEngineEnv = process.env.YUKAKO_RUN_ENGINE;
        const runAdminEnv = process.env.YUKAKO_RUN_ADMIN;
        const runProxyEnv = process.env.YUKAKO_RUN_PROXY;

        assertEnvExists(runLeaderEnv, 'YUKAKO_RUN_LEADER');
        assertEnvExists(runEngineEnv, 'YUKAKO_RUN_ENGINE');
        assertEnvExists(runAdminEnv, 'YUKAKO_RUN_ADMIN');
        assertEnvExists(runProxyEnv, 'YUKAKO_RUN_PROXY');

        const leader = runLeaderEnv === '1';
        const engine = runEngineEnv === '1';
        const admin = runAdminEnv === '1';
        const proxy = runProxyEnv === '1';

        return {
            leader,
            engine,
            admin,
            proxy,
        };
    }

    processesToRunEnv(opts: {
        leader?: boolean;
        engine?: boolean;
        admin?: boolean;
        proxy?: boolean;
    }): {
        YUKAKO_RUN_LEADER: string;
        YUKAKO_RUN_ENGINE: string;
        YUKAKO_RUN_ADMIN: string;
        YUKAKO_RUN_PROXY: string;
    } {
        return {
            YUKAKO_RUN_LEADER: opts.leader ? '1' : '0',
            YUKAKO_RUN_ENGINE: opts.engine ? '1' : '0',
            YUKAKO_RUN_ADMIN: opts.admin ? '1' : '0',
            YUKAKO_RUN_PROXY: opts.proxy ? '1' : '0',
        };
    }

    static leaderConfig(): LeaderConfig {
        const dataDir = process.env.LEADER_DATA_DIR;
        const wsAddr = process.env.LEADER_WS_ADDR;

        assertEnvExists(dataDir, 'LEADER_DATA_DIR');
        assertEnvExists(wsAddr, 'LEADER_WS_ADDR');

        return {
            dataDir,
            wsAddr,
        };
    }

    buildLeaderConfigEnv(): LeaderConfigEnv {
        const dataDir = this._data_dir;
        const wsAddr = this.leaderWsSocketPath();

        return {
            LEADER_DATA_DIR: dataDir,
            LEADER_WS_ADDR: wsAddr,
        };
    }

    static engineConfig(): EngineConfig {
        const dataDir = process.env.ENGINE_DATA_DIR;
        const leaderWsAddr = process.env.ENGINE_LEADER_WS_ADDR;

        assertEnvExists(dataDir, 'ENGINE_DATA_DIR');
        assertEnvExists(leaderWsAddr, 'ENGINE_LEADER_WS_ADDR');

        return {
            dataDir,
            leaderWsAddr,
        };
    }

    buildEngineConfigEnv(): EngineConfigEnv {
        const dataDir = this._data_dir;
        const leaderWsAddr = this.leaderWsSocketPath();

        return {
            ENGINE_DATA_DIR: dataDir,
            ENGINE_LEADER_WS_ADDR: leaderWsAddr,
        };
    }

    static adminConfig(): AdminConfig {
        const dataDir = process.env.ADMIN_DATA_DIR;
        const leaderWsAddr = process.env.ADMIN_LEADER_WS_ADDR;

        assertEnvExists(dataDir, 'ADMIN_DATA_DIR');
        assertEnvExists(leaderWsAddr, 'ADMIN_LEADER_WS_ADDR');

        return {
            dataDir,
            leaderWsAddr,
        };
    }

    buildAdminConfigEnv(): AdminConfigEnv {
        const dataDir = this._data_dir;
        const leaderWsAddr = this.leaderWsSocketPath();

        return {
            ADMIN_DATA_DIR: dataDir,
            ADMIN_LEADER_WS_ADDR: leaderWsAddr,
        };
    }

    static proxyConfig(): ProxyConfig {
        const dataDir = process.env.PROXY_DATA_DIR;
        const leaderWsAddr = process.env.PROXY_LEADER_WS_ADDR;

        assertEnvExists(dataDir, 'PROXY_DATA_DIR');
        assertEnvExists(leaderWsAddr, 'PROXY_LEADER_WS_ADDR');

        return {
            dataDir,
            leaderWsAddr,
        };
    }

    buildProxyConfigEnv(): ProxyConfigEnv {
        const dataDir = this._data_dir;
        const leaderWsAddr = this.leaderWsSocketPath();

        return {
            PROXY_DATA_DIR: dataDir,
            PROXY_LEADER_WS_ADDR: leaderWsAddr,
        };
    }
}
