import { CapnpComponent, HttpOptions } from './index';
import { WorkerDesignator } from './workers';
import { indentBlock } from './util/indent';

export interface Service extends CapnpComponent {
    _name: string;
}

export class WorkerService implements Service {
    public _name!: string;
    public _worker!: WorkerDesignator;

    private constructor() {}

    static new(name?: string, worker?: WorkerDesignator) {
        const service = new WorkerService();
        if (name) service.setName(name);
        if (worker) service.setWorker(worker);
        return service;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setWorker(worker: WorkerDesignator) {
        this._worker = worker;
        return this;
    }

    render() {
        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        if (this._worker === undefined) {
            throw new Error('Worker is undefined');
        }

        return `(
	name = "${this._name}",
	worker = ${this._worker.render()}
)`;
    }
}

export type AllowDenyListItem =
    | 'private'
    | 'public'
    | 'local'
    | 'network'
    | 'unix'
    | 'unix-abstract';

export class NetworkService implements Service {
    public _name!: string;
    public _allow!: AllowDenyListItem[];
    public _deny!: AllowDenyListItem[];

    private constructor() {}

    static new(
        name?: string,
        allow?: AllowDenyListItem[],
        deny?: AllowDenyListItem[],
    ) {
        const service = new NetworkService();
        if (name) service.setName(name);
        if (allow) service.setAllow(allow);
        if (deny) service.setDeny(deny);
        return service;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setAllow(allow: AllowDenyListItem[]) {
        this._allow = allow;
        return this;
    }

    setDeny(deny: AllowDenyListItem[]) {
        this._deny = deny;
        return this;
    }

    render() {
        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        if (this._allow === undefined) {
            throw new Error('Allow is undefined');
        }

        if (this._deny === undefined) {
            throw new Error('Deny is undefined');
        }

        return `(
	name = "${this._name}",
	network = (
	    allow = [${this._allow.map((item) => `"${item}"`).join(', ')}],
	    deny = [${this._deny.map((item) => `"${item}"`).join(', ')}]
	)
)`;
    }
}

export class ExternalServer implements Service {
    public _name!: string;
    public _address!: string;
    public _http!: HttpOptions;

    private constructor() {}

    static new(name?: string, address?: string, http?: HttpOptions) {
        const service = new ExternalServer();
        if (name) service.setName(name);
        if (address) service.setAddress(address);
        if (http) service.setHttp(http);
        return service;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setAddress(address: string) {
        this._address = address;
        return this;
    }

    setHttp(http: HttpOptions) {
        this._http = http;
        return this;
    }

    render() {
        return `(
	name = "${this._name}",
	external = (
	    address = "${this._address}",
	    http = ${indentBlock(this._http.render(), {
            indentFirstLine: false,
            times: 2,
        })}
	)
)`;
    }
}

export class DiskService implements Service {
    public _name!: string;
    public _path!: string;
    public _writable: boolean = false;
    public _allowDotFiles: boolean = false;

    private constructor() {}

    static new(
        name?: string,
        path?: string,
        writable?: boolean,
        allowDotFiles?: boolean,
    ) {
        const service = new DiskService();
        if (name) service.setName(name);
        if (path) service.setPath(path);
        if (writable) service.setWritable(writable);
        if (allowDotFiles) service.setAllowDotFiles(allowDotFiles);
        return service;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setPath(path: string) {
        this._path = path;
        return this;
    }

    setWritable(writable: boolean) {
        this._writable = writable;
        return this;
    }

    setAllowDotFiles(allowDotFiles: boolean) {
        this._allowDotFiles = allowDotFiles;
        return this;
    }

    render() {
        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        if (this._path === undefined) {
            throw new Error('Path is undefined');
        }

        if (this._writable === undefined) {
            throw new Error('Writable is undefined');
        }

        if (this._allowDotFiles === undefined) {
            throw new Error('AllowDotFiles is undefined');
        }

        return `(
	name = "${this._name}",
	disk = (
	    path = "${this._path}",
	    writable = ${this._writable},
	    allowDotFiles = ${this._allowDotFiles}
	)
)`;
    }
}

export class ServiceDesignator implements CapnpComponent {
    public _name!: string;

    private constructor() {}

    static new(name?: string) {
        const service = new ServiceDesignator();
        if (name) service.setName(name);
        return service;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    get name() {
        return this._name;
    }

    render() {
        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        return `"${this._name}"`;
    }
}
