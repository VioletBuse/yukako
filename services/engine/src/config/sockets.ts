import { CapnpComponent } from './index';
import { ServiceDesignator } from './services';

export interface Socket extends CapnpComponent {}

export class Socket implements Socket {
    public _name!: string;
    public _address!: string;
    public _service!: ServiceDesignator;

    private constructor() {}

    static new(name?: string, address?: string, service?: ServiceDesignator) {
        const socket = new Socket();
        if (name) socket.setName(name);
        if (address) socket.setAddress(address);
        if (service) socket.setService(service);
        return socket;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setAddress(address: string) {
        this._address = address;
        return this;
    }

    setService(service: ServiceDesignator) {
        this._service = service;
        return this;
    }

    render() {
        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        if (this._address === undefined) {
            throw new Error('Address is undefined');
        }

        if (this._service === undefined) {
            throw new Error('Service is undefined');
        }

        return `(
    name = "${this._name}",
	address = "${this._address}",
	http = (),
	service = ${this._service.render()}
)`;
    }
}
