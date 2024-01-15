import { CapnpComponent, CapnpValue, ServiceDesignator } from '../index';
import { indentBlock } from '../util/indent';
import { WorkerModule } from './modules';
import { WorkerBinding } from './bindings';

export * from './modules';
export * from './bindings';

export interface WorkerDefinition extends CapnpComponent {}

export class WorkerDefinition implements WorkerDefinition {
    public _name!: string;
    public _modules: WorkerModule[] = [];
    public _compatibilityDate!: string;
    public _compatibilityFlags: string[] = [];
    public _bindings: WorkerBinding[] = [];

    private constructor() {}

    static new(
        name?: string,
        modules?: WorkerModule[],
        compatibilityDate?: string,
        compatibilityFlags?: string[],
        bindings?: WorkerBinding[],
    ) {
        const worker = new WorkerDefinition();
        if (name) worker.setName(name);
        if (modules) worker.setModules(modules);
        if (compatibilityDate) worker.setCompatibilityDate(compatibilityDate);
        if (compatibilityFlags)
            worker.setCompatibilityFlags(compatibilityFlags);
        if (bindings) worker.setBindings(bindings);
        return worker;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setModules(modules: WorkerModule[]) {
        this._modules = modules;
        return this;
    }

    addModule(module: WorkerModule) {
        this._modules.push(module);
        return this;
    }

    removeModule(module: WorkerModule | string) {
        if (typeof module === 'string') {
            this._modules = this._modules.filter((m) => m.name !== module);
        } else {
            this._modules = this._modules.filter((m) => m !== module);
        }
        return this;
    }

    setCompatibilityDate(compatibilityDate: string) {
        this._compatibilityDate = compatibilityDate;
        return this;
    }

    setCompatibilityFlags(compatibilityFlags: string[]) {
        this._compatibilityFlags = compatibilityFlags;
        return this;
    }

    addCompatibilityFlag(compatibilityFlag: string) {
        this._compatibilityFlags.push(compatibilityFlag);
        return this;
    }

    removeCompatibilityFlag(compatibilityFlag: string) {
        this._compatibilityFlags = this._compatibilityFlags.filter(
            (f) => f !== compatibilityFlag,
        );
        return this;
    }

    setBindings(bindings: WorkerBinding[]) {
        this._bindings = bindings;
        return this;
    }

    addBinding(binding: WorkerBinding) {
        this._bindings.push(binding);
        return this;
    }

    removeBinding(binding: WorkerBinding | string) {
        if (typeof binding === 'string') {
            this._bindings = this._bindings.filter((b) => b._name !== binding);
        } else {
            this._bindings = this._bindings.filter((b) => b !== binding);
        }
        return this;
    }

    replaceBinding(binding: WorkerBinding | string, newBinding: WorkerBinding) {
        if (typeof binding === 'string') {
            this._bindings = this._bindings.map((b) =>
                b._name === binding ? newBinding : b,
            );
        } else {
            this._bindings = this._bindings.map((b) =>
                b === binding ? newBinding : b,
            );
        }
        return this;
    }

    render() {
        if (typeof this._name === 'undefined') {
            throw new Error('Worker name is required');
        }

        if (typeof this._modules === 'undefined') {
            throw new Error('Worker modules are required');
        }

        if (!this._compatibilityDate) {
            throw new Error('Worker compatibility date is required');
        }

        if (typeof this._compatibilityFlags === 'undefined') {
            throw new Error('Worker compatibility flags are required');
        }

        if (typeof this._bindings === 'undefined') {
            throw new Error('Worker bindings are required');
        }

        const modules = this._modules
            .map((module) => module.render())
            .join(',\n');
        const compatibilityFlags = this._compatibilityFlags
            .map((flag) => `"${flag}"`)
            .join(',\n');
        const bindings = this._bindings
            .map((binding) => binding.render())
            .join(', ');

        return `const ${this._name}: Workerd.Worker = (
    modules = [
${indentBlock(modules, { times: 2 })}
    ],
    compatibilityDate = "${this._compatibilityDate}",
    compatibilityFlags = [
${indentBlock(compatibilityFlags, { times: 2 })}
    ],
    bindings = [
${indentBlock(bindings, { times: 2 })}
    ]
);`;
    }
}

export class WorkerDesignator implements CapnpComponent {
    public _name!: string;

    private constructor() {}

    static new(name?: string) {
        const designator = new WorkerDesignator();
        if (name) designator.setName(name);
        return designator;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    get name() {
        return this._name;
    }

    render() {
        if (typeof this._name === 'undefined') {
            throw new Error('Worker name is required');
        }

        return `.${this._name}`;
    }
}
