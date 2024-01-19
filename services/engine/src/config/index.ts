import { Service } from './services';
import { Socket } from './sockets';
import { WorkerDefinition } from './workers';
import { indentBlock } from './util/indent';
import { Extension } from './extensions';

export * from './services';
export * from './sockets';
export * from './workers';
export * from './extensions';

export interface CapnpComponent {
    render: () => string;
}

export class WorkerdConfig implements CapnpComponent {
    public _services: Service[] = [];
    public _sockets: Socket[] = [];
    public _extensions: Extension[] = [];
    public _workers: WorkerDefinition[] = [];

    private constructor() {}

    static new(
        services?: Service[],
        sockets?: Socket[],
        extensions?: Extension[],
        workers?: WorkerDefinition[],
    ) {
        const config = new WorkerdConfig();
        if (services) config.setServices(services);
        if (sockets) config.setSockets(sockets);
        if (extensions) config.setExtensions(extensions);
        if (workers) config.setWorkers(workers);
        return config;
    }

    setServices(services: Service[]) {
        this._services = services;
        return this;
    }

    addService(service: Service) {
        this._services.push(service);
        return this;
    }

    removeService(service: Service | string) {
        if (typeof service === 'string') {
            this._services = this._services.filter((s) => s._name !== service);
        } else {
            this._services = this._services.filter((s) => s !== service);
        }
        return this;
    }

    setSockets(sockets: Socket[]) {
        this._sockets = sockets;
        return this;
    }

    addSocket(socket: Socket) {
        this._sockets.push(socket);
        return this;
    }

    removeSocket(socket: Socket | string) {
        if (typeof socket === 'string') {
            this._sockets = this._sockets.filter((s) => s._name !== socket);
        } else {
            this._sockets = this._sockets.filter((s) => s !== socket);
        }
        return this;
    }

    setExtensions(extensions: Extension[]) {
        this._extensions = extensions;
        return this;
    }

    addExtension(extension: Extension) {
        this._extensions.push(extension);
        return this;
    }

    removeExtension(extension: Extension) {
        this._extensions = this._extensions.filter((s) => s !== extension);
        return this;
    }

    setWorkers(workers: WorkerDefinition[]) {
        this._workers = workers;
        return this;
    }

    addWorker(worker: WorkerDefinition) {
        this._workers.push(worker);
        return this;
    }

    removeWorker(worker: WorkerDefinition) {
        this._workers = this._workers.filter((s) => s !== worker);
        return this;
    }

    worker(name: string) {
        return this._workers.find((w) => w._name === name);
    }

    render() {
        const services = this._services.map((service) => service.render());
        const sockets = this._sockets.map((socket) => socket.render());
        const extensions = this._extensions.map((extension) =>
            extension.render(),
        );
        const workers = this._workers.map((worker) => worker.render());

        const servicesBlock =
            'services = [\n' + indentBlock(services.join(', ')) + '\n]';
        const socketsBlock =
            'sockets = [\n' + indentBlock(sockets.join(', ')) + '\n]';
        const extensionsBlock =
            'extensions = [\n' + indentBlock(extensions.join(', ')) + '\n]';

        const workersBlock = workers.join('\n\n');

        return `
using Workerd = import "/workerd/workerd.capnp";

const config :Workerd.Config = (
	${indentBlock(servicesBlock, { indentFirstLine: false })},
	${indentBlock(socketsBlock, { indentFirstLine: false })},
	${indentBlock(extensionsBlock, { indentFirstLine: false })},
);

${workersBlock}
`;
    }
}

export class Header implements CapnpComponent {
    public _name!: string;
    public _value!: string;

    private constructor() {}

    static new(name?: string, value?: string) {
        const header = new Header();
        if (name) header.setName(name);
        if (value) header.setValue(value);
        return header;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setValue(value: string) {
        this._value = value;
        return this;
    }

    render() {
        return `(
    name = "${this._name}",
    value = "${this._value}"
)`;
    }
}

export class HttpOptions implements CapnpComponent {
    public _style: 'host' | 'proxy' = 'host';
    public _injectRequestHeaders: Header[] = [];
    public _injectResponseHeaders: Header[] = [];

    private constructor() {}

    static new(
        style?: 'host' | 'proxy',
        injectRequestHeaders?: Header[],
        injectResponseHeaders?: Header[],
    ) {
        const options = new HttpOptions();
        if (style) options.setStyle(style);
        if (injectRequestHeaders)
            options.setInjectRequestHeaders(injectRequestHeaders);
        if (injectResponseHeaders)
            options.setInjectResponseHeaders(injectResponseHeaders);
        return options;
    }

    setStyle(style: 'host' | 'proxy') {
        this._style = style;
        return this;
    }

    setInjectRequestHeaders(injectRequestHeaders: Header[]) {
        this._injectRequestHeaders = injectRequestHeaders;
        return this;
    }

    setInjectResponseHeaders(injectResponseHeaders: Header[]) {
        this._injectResponseHeaders = injectResponseHeaders;
        return this;
    }

    render() {
        if (this._injectRequestHeaders === undefined) {
            throw new Error('injectRequestHeaders is undefined');
        }

        if (this._injectResponseHeaders === undefined) {
            throw new Error('injectResponseHeaders is undefined');
        }

        const injectRequestHeaders = this._injectRequestHeaders
            .map((header) => header.render())
            .join(', ');
        const injectResponseHeaders = this._injectResponseHeaders
            .map((header) => header.render())
            .join(', ');

        return `(
    style = ${this._style},
    injectRequestHeaders = [
${indentBlock(injectRequestHeaders, { times: 3 })}
    ],
    injectResponseHeaders = [
${indentBlock(injectResponseHeaders, { times: 3 })}
    ]
)`;
    }
}

export interface CapnpValue extends CapnpComponent {}

export class CapnpEmbed implements CapnpValue {
    public _path!: string;

    private constructor() {}

    static new(path: string) {
        const embed = new CapnpEmbed();
        if (path) embed.setPath(path);
        return embed;
    }

    setPath(path: string) {
        this._path = path;
        return this;
    }

    render() {
        if (this._path === undefined) {
            throw new Error('Path is undefined');
        }

        return `embed "${this._path}"`;
    }
}

export class CapnpText implements CapnpValue {
    public _value!: string;

    private constructor() {}

    static new(value: string) {
        const text = new CapnpText();
        if (value) text.setValue(value);
        return text;
    }

    setValue(value: string) {
        this._value = value;
        return this;
    }

    render() {
        if (this._value === undefined) {
            throw new Error('Value is undefined');
        }

        return `${JSON.stringify(this._value)}`;
    }
}

export class CapnpJSON implements CapnpValue {
    public _value!: any;

    private constructor() {}

    static new(value: any) {
        const json = new CapnpJSON();
        if (value) json.setValue(value);
        return json;
    }

    setValue(value: any) {
        this._value = value;
        return this;
    }

    //make sure to surround with quotation marks if not already
    render() {
        if (this._value === undefined) {
            throw new Error('Value is undefined');
        }

        const stringified = JSON.stringify(this._value);

        return `${JSON.stringify(stringified)}`;
    }
}
