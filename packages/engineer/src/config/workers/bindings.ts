import { CapnpComponent, CapnpValue, ServiceDesignator } from '../index';
import { indentBlock } from '../util/indent';

export interface WorkerBinding extends CapnpComponent {
    _name: string;
}

export class TextBinding implements WorkerBinding {
    public _name!: string;
    public _value!: CapnpValue;

    private constructor() {}

    static new(name?: string, value?: CapnpValue) {
        const binding = new TextBinding();
        if (name) binding.setName(name);
        if (value) binding.setValue(value);
        return binding;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setValue(value: CapnpValue) {
        this._value = value;
        return this;
    }

    render() {
        if (!this._name) throw new Error('Name is required');
        if (!this._value) throw new Error('Value is required');

        return `(
    name = "${this._name}",
    text = ${this._value.render()}
)`;
    }
}

export class DataBinding implements WorkerBinding {
    public _name!: string;
    public _value!: CapnpValue;

    private constructor() {}

    static new(name?: string, value?: CapnpValue) {
        const binding = new DataBinding();
        if (name) binding.setName(name);
        if (value) binding.setValue(value);
        return binding;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setValue(value: CapnpValue) {
        this._value = value;
        return this;
    }

    render() {
        if (!this._name) throw new Error('Name is required');
        if (!this._value) throw new Error('Value is required');

        return `(
    name = "${this._name}",
    data = ${this._value.render()}
)`;
    }
}

export class JSONBinding implements WorkerBinding {
    public _name!: string;
    public _value!: CapnpValue;

    private constructor() {}

    static new(name?: string, value?: CapnpValue) {
        const binding = new JSONBinding();
        if (name) binding.setName(name);
        if (value) binding.setValue(value);
        return binding;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setValue(value: CapnpValue) {
        this._value = value;
        return this;
    }

    render() {
        if (!this._name) throw new Error('Name is required');
        if (!this._value) throw new Error('Value is required');

        return `(
    name = "${this._name}",
    json = ${this._value.render()}
)`;
    }
}

export class ServiceBinding implements WorkerBinding {
    public _name!: string;
    public _service!: ServiceDesignator;

    private constructor() {}

    static new(name?: string, service?: ServiceDesignator) {
        const binding = new ServiceBinding();
        if (name) binding.setName(name);
        if (service) binding.setService(service);
        return binding;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setService(service: ServiceDesignator) {
        this._service = service;
        return this;
    }

    render() {
        if (!this._name) throw new Error('Name is required');
        if (!this._service) throw new Error('Service is required');

        return `(
    name = "${this._name}",
    service = ${this._service.render()}
)`;
    }
}

export class FromEnvironmentBinding implements WorkerBinding {
    public _name!: string;
    public _envVar!: string;

    private constructor() {}

    static new(name?: string, envVar?: string) {
        const binding = new FromEnvironmentBinding();
        if (name) binding.setName(name);
        if (envVar) binding.setEnvVar(envVar);
        return binding;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setEnvVar(envVar: string) {
        this._envVar = envVar;
        return this;
    }

    render() {
        if (!this._name) throw new Error('Name is required');
        if (!this._envVar) throw new Error('Environment variable is required');

        return `(
	name = "${this._name}",
	fromEnvironment = "${this._envVar}"
)`;
    }
}

export class WrappedBinding implements WorkerBinding {
    public _name!: string;
    public _moduleName!: string;
    public _entrypoint: string = 'default';
    public _innerBindings!: WorkerBinding[];

    private constructor() {}

    static new(
        name?: string,
        moduleName?: string,
        entrypoint?: string,
        innerBindings?: WorkerBinding[],
    ) {
        const binding = new WrappedBinding();
        if (name) binding.setName(name);
        if (moduleName) binding.setModuleName(moduleName);
        if (entrypoint) binding.setEntrypoint(entrypoint);
        if (innerBindings) binding.setInnerBindings(innerBindings);
        return binding;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setModuleName(moduleName: string) {
        this._moduleName = moduleName;
        return this;
    }

    setEntrypoint(entrypoint: string) {
        this._entrypoint = entrypoint;
        return this;
    }

    setInnerBindings(innerBindings: WorkerBinding[]) {
        this._innerBindings = innerBindings;
        return this;
    }

    render() {
        if (!this._name) throw new Error('Name is required');
        if (!this._moduleName) throw new Error('Module name is required');
        if (!this._innerBindings)
            throw new Error('Inner bindings are required');

        const innerBindings = this._innerBindings
            .map((binding) => binding.render())
            .join(',\n');

        return `(
	name = "${this._name}",
	wrapped = (
	    moduleName = "${this._moduleName}",
	    entrypoint = "${this._entrypoint}",
	    innerBindings = [
${indentBlock(innerBindings, { times: 3 })}
	    ]
	)
)`;
    }
}
