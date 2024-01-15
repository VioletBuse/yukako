import { CapnpComponent, CapnpValue } from './index';
import { indentBlock } from './util/indent';

export class ExtensionModule implements CapnpComponent {
    public _name!: string;
    public _internal: boolean = false;
    public _esModule!: CapnpValue;

    private constructor() {}

    static new(name?: string, internal?: boolean, esModule?: CapnpValue) {
        const module = new ExtensionModule();
        if (name) module.setName(name);
        if (internal) module.setInternal(internal);
        if (esModule) module.setEsModule(esModule);
        return module;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    setInternal(internal: boolean) {
        this._internal = internal;
        return this;
    }

    setEsModule(esModule: CapnpValue) {
        this._esModule = esModule;
        return this;
    }

    render() {
        if (this._name === undefined) {
            throw new Error('Name is undefined');
        }

        if (this._esModule === undefined) {
            throw new Error('esModule is undefined');
        }

        return `(
	name = "${this._name}",
	internal = ${this._internal},
	esModule = ${this._esModule.render()}
)`;
    }
}

export class Extension implements CapnpComponent {
    public _modules: ExtensionModule[] = [];

    private constructor() {}

    static new(modules?: ExtensionModule[]) {
        const extension = new Extension();
        if (modules) extension.setModules(modules);
        return extension;
    }

    setModules(modules: ExtensionModule[]) {
        this._modules = modules;
        return this;
    }

    render() {
        const modules = this._modules
            .map((module) => module.render())
            .join(', ');

        return `(
	modules = [
${indentBlock(modules, { times: 2 })}
	]
)`;
    }
}
