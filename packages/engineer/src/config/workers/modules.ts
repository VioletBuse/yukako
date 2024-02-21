import { CapnpComponent, CapnpValue } from '../index';

export interface WorkerModule extends CapnpComponent {
    name: string;
    type:
        | 'esm'
        | 'cjs'
        | 'text'
        | 'data'
        | 'wasm'
        | 'json'
        | 'nodeJsCompatModule';
}

export class EsModule implements WorkerModule {
    public _name!: string;
    public _value!: CapnpValue;

    private constructor() {}

    static new(name?: string, value?: CapnpValue) {
        const module = new EsModule();
        if (name) module.setName(name);
        if (value) module.setValue(value);
        return module;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setValue(value: CapnpValue) {
        this._value = value;
        return this;
    }

    get name() {
        return this._name;
    }

    get type() {
        return 'esm' as const;
    }

    render() {
        if (this._value === undefined) {
            throw new Error('Value is undefined');
        }

        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        return `( name = "${this._name}", esModule = ${this._value.render()} )`;
    }
}

export class TextModule implements WorkerModule {
    public _name!: string;
    public _value!: CapnpValue;

    private constructor() {}

    static new(name?: string, value?: CapnpValue) {
        const module = new TextModule();
        if (name) module.setName(name);
        if (value) module.setValue(value);
        return module;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setValue(value: CapnpValue) {
        this._value = value;
        return this;
    }

    get name() {
        return this._name;
    }

    get type() {
        return 'text' as const;
    }

    render() {
        if (this._value === undefined) {
            throw new Error('Value is undefined');
        }

        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        return `( name = "${this._name}", text = "${this._value.render()}" )`;
    }
}

export class DataModule implements WorkerModule {
    public _name!: string;
    public _value!: CapnpValue;

    private constructor() {}

    static new(name?: string, value?: CapnpValue) {
        const module = new DataModule();
        if (name) module.setName(name);
        if (value) module.setValue(value);
        return module;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setValue(value: CapnpValue) {
        this._value = value;
        return this;
    }

    get name() {
        return this._name;
    }

    get type() {
        return 'data' as const;
    }

    render() {
        if (this._value === undefined) {
            throw new Error('Value is undefined');
        }

        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        return `( name = "${this._name}", data = ${this._value.render()} )`;
    }
}

export class WasmModule implements WorkerModule {
    public _name!: string;
    public _value!: CapnpValue;

    private constructor() {}

    static new(name?: string, value?: CapnpValue) {
        const module = new WasmModule();
        if (name) module.setName(name);
        if (value) module.setValue(value);
        return module;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setValue(value: CapnpValue) {
        this._value = value;
        return this;
    }

    get name() {
        return this._name;
    }

    get type() {
        return 'wasm' as const;
    }

    render() {
        if (this._value === undefined) {
            throw new Error('Value is undefined');
        }

        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        return `( name = "${this._name}", wasm = ${this._value.render()} )`;
    }
}

export class JsonModule implements WorkerModule {
    public _name!: string;
    public _value!: CapnpValue;

    private constructor() {}

    static new(name?: string, value?: CapnpValue) {
        const module = new JsonModule();
        if (name) module.setName(name);
        if (value) module.setValue(value);
        return module;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setValue(value: CapnpValue) {
        this._value = value;
        return this;
    }

    get name() {
        return this._name;
    }

    get type() {
        return 'json' as const;
    }

    render() {
        if (this._value === undefined) {
            throw new Error('Value is undefined');
        }

        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        return `( name = "${this._name}", json = ${this._value.render()} )`;
    }
}

export class NodeJsCompatModule implements WorkerModule {
    public _name!: string;
    public _value!: CapnpValue;

    private constructor() {}

    static new(name?: string, value?: CapnpValue) {
        const module = new NodeJsCompatModule();
        if (name) module.setName(name);
        if (value) module.setValue(value);
        return module;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setValue(value: CapnpValue) {
        this._value = value;
        return this;
    }

    get name() {
        return this._name;
    }

    get type() {
        return 'nodeJsCompatModule' as const;
    }

    render() {
        if (this._value === undefined) {
            throw new Error('Value is undefined');
        }

        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        return `( name = "${
            this._name
        }", nodeJsCompatModule = ${this._value.render()} )`;
    }
}
