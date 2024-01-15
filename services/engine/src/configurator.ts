import {
    AllowDenyListItem,
    CapnpEmbed,
    CapnpJSON,
    CapnpText,
    DataBinding,
    DataModule,
    DiskService,
    EsModule,
    ExternalServer,
    Header,
    HttpOptions,
    JSONBinding,
    JsonModule,
    NetworkService,
    Service,
    ServiceBinding,
    ServiceDesignator,
    Socket,
    TextBinding,
    TextModule,
    WasmModule,
    WorkerBinding,
    WorkerdConfig,
    WorkerDefinition,
    WorkerDesignator,
    WorkerModule,
    WorkerService,
    WrappedBinding,
} from './config';
import { entrypoint, router, RouterMeta } from '@yukako/extensions';
import * as path from 'path';
import { match } from 'ts-pattern';
import { nanoid } from 'nanoid';
import * as fs from 'fs-extra';
import { produce } from 'immer';
import { Data } from 'ws';

type BaseBindingData =
    | {
          type: 'text';
          name: string;
          value: string;
      }
    | {
          type: 'data';
          name: string;
          value: DataView;
      }
    | {
          type: 'json';
          name: string;
          value: any;
      }
    | {
          type: 'service';
          name: string;
          service: Service;
      }
    | {
          type: 'wrapped';
          name: string;
          module: string;
          entrypoint?: string;
          innerBindings: BaseBindingData[];
      };

type BaseServiceData =
    | {
          type: 'worker';
          worker: WorkerDefinition;
      }
    | {
          type: 'network';
          name: string;
          allow: AllowDenyListItem[];
          deny: AllowDenyListItem[];
      }
    | {
          type: 'external';
          name: string;
          address: string;
          httpOptions?: {
              type?: 'proxy' | 'host';
              injectRequestHeaders?:
                  | [string, string][]
                  | Record<string, string>;
              injectResponseHeaders?:
                  | [string, string][]
                  | Record<string, string>;
          };
      }
    | {
          type: 'disk';
          name: string;
          path: string;
          writable?: boolean;
          allowDotFiles?: boolean;
      };

type File = {
    name: string;
    content: string | DataView;
    meta: {
        type: 'esmodule' | 'wasm' | 'json' | 'text' | 'data';
    };
};

class ArtifactStore {
    private files: Record<string, File[]> = {};

    constructor() {}

    public addFile(project: string, file: File) {
        if (!this.files[project]) {
            this.files[project] = [];
        }

        this.files[project].push(file);

        return this;
    }

    public writeFiles(dir: string) {
        const files = Object.entries(this.files);

        for (const [_dir, _files] of files) {
            fs.ensureDirSync(path.join(dir, _dir));

            _files.forEach((file) => {
                const filePath = path.join(dir, _dir, file.name);

                fs.writeFileSync(filePath, file.content);
            });
        }
    }
}

export class Configurator {
    private config: WorkerdConfig = WorkerdConfig.new();
    private artifacts: ArtifactStore = new ArtifactStore();
    private workerId: string = 'workerd-instance';
    private routerMeta: RouterMeta = { routes: [], id: 'workerd-instance' };
    private listenAddress: string = '*:8080';
    private adminApiAddress: string = '127.0.0.1:8081';

    private constructor() {}

    private setWorkerId(id: string) {
        this.workerId = id;
        this.routerMeta.id = id;
        return this;
    }

    private setListenAddress(address: string) {
        this.listenAddress = address;

        const routerSocket = this.getRouterSocket();

        routerSocket.setAddress(address);

        return this;
    }

    private setAdminApiAddress(address: string) {
        this.adminApiAddress = address;

        const adminApiService = this.getAdminApiService() as ExternalServer;

        adminApiService.setAddress(address);

        return this;
    }

    private baseAddModule(
        worker: WorkerDefinition,
        module: {
            importName: string;
            fileName: string;
            projectName: string;
            fileContent: string | DataView;
            type: 'esmodule' | 'wasm' | 'json' | 'text' | 'data';
        },
    ) {
        const filePath = path.join(
            'artifacts',
            module.projectName,
            module.fileName,
        );

        const embedExpr = CapnpEmbed.new(filePath);

        const newModule = match(module)
            .returnType<WorkerModule>()
            .with({ type: 'esmodule' }, (_module) =>
                EsModule.new(_module.importName).setValue(embedExpr),
            )
            .with({ type: 'wasm' }, (_module) =>
                WasmModule.new(_module.importName).setValue(embedExpr),
            )
            .with({ type: 'json' }, (_module) =>
                JsonModule.new(_module.importName).setValue(embedExpr),
            )
            .with({ type: 'text' }, (_module) =>
                TextModule.new(_module.importName).setValue(embedExpr),
            )
            .with({ type: 'data' }, (_module) =>
                DataModule.new(_module.importName).setValue(embedExpr),
            )
            .exhaustive();

        worker.addModule(newModule);
    }

    private baseBindingDataToBinding(binding: BaseBindingData): WorkerBinding {
        return match(binding)
            .returnType<WorkerBinding>()
            .with({ type: 'text' }, (binding) =>
                TextBinding.new()
                    .setName(binding.name)
                    .setValue(CapnpText.new(binding.value)),
            )
            .with({ type: 'data' }, (binding) => {
                const dataFileName = `${binding.name}_${nanoid()}.data`;

                this.artifacts.addFile('__yukako_data_binding_data', {
                    content: binding.value,
                    name: dataFileName,
                    meta: {
                        type: 'data',
                    },
                });

                const dataFilePath = path.join(
                    'artifacts',
                    '__yukako_data_binding_data',
                    dataFileName,
                );

                return DataBinding.new()
                    .setName(binding.name)
                    .setValue(CapnpEmbed.new(dataFilePath));
            })
            .with({ type: 'json' }, (binding) =>
                JSONBinding.new()
                    .setName(binding.name)
                    .setValue(CapnpJSON.new(binding.value)),
            )
            .with({ type: 'service' }, (binding) =>
                ServiceBinding.new()
                    .setName(binding.name)
                    .setService(ServiceDesignator.new(binding.service._name)),
            )
            .with({ type: 'wrapped' }, (binding) => {
                return WrappedBinding.new()
                    .setName(binding.name)
                    .setModuleName(binding.module)
                    .setEntrypoint(binding.entrypoint ?? 'default')
                    .setInnerBindings(
                        binding.innerBindings.map(
                            this.baseBindingDataToBinding,
                        ),
                    );
            })
            .exhaustive();
    }

    private baseAddBinding(
        worker: WorkerDefinition,
        _binding: BaseBindingData,
    ) {
        const newBinding = this.baseBindingDataToBinding(_binding);

        worker.addBinding(newBinding);

        return newBinding;
    }

    private baseUpsertBinding(
        worker: WorkerDefinition,
        bindingName: string,
        _binding: BaseBindingData,
    ) {
        worker.removeBinding(bindingName);
        this.baseAddBinding(worker, _binding);
    }

    private baseCreateWorker(worker: {
        compatibilityDate?: string;
        name: string;
        modules: {
            importName: string;
            fileName: string;
            fileContent: string | DataView;
            type: 'esmodule' | 'wasm' | 'json' | 'text' | 'data';
        }[];
        bindings: BaseBindingData[];
    }) {
        const newWorker = WorkerDefinition.new();

        newWorker.setCompatibilityDate(
            worker.compatibilityDate ?? '2023-01-01',
        );
        newWorker.setName(worker.name);

        worker.modules.forEach((module) => {
            this.baseAddModule(newWorker, {
                ...module,
                projectName: worker.name,
            });
            this.artifacts.addFile(worker.name, {
                name: module.fileName,
                content: module.fileContent,
                meta: {
                    type: module.type,
                },
            });
        });

        worker.bindings.forEach((binding) => {
            this.baseAddBinding(newWorker, binding);
        });

        this.config.addWorker(newWorker);

        return newWorker;
    }

    private baseCreateService(data: BaseServiceData) {
        const newService = match(data)
            .returnType<Service>()
            .with({ type: 'worker' }, (data) =>
                WorkerService.new()
                    .setName(data.worker._name)
                    .setWorker(
                        WorkerDesignator.new().setName(data.worker._name),
                    ),
            )
            .with({ type: 'network' }, (data) =>
                NetworkService.new()
                    .setName(data.name)
                    .setAllow(data.allow)
                    .setDeny(data.deny),
            )
            .with({ type: 'external' }, (data) => {
                const httpOptions = HttpOptions.new();

                httpOptions.setStyle(data.httpOptions?.type ?? 'proxy');

                let injectRequestHeaders: Header[] = [];
                let injectResponseHeaders: Header[] = [];

                if (data.httpOptions?.injectRequestHeaders) {
                    if (Array.isArray(data.httpOptions.injectRequestHeaders)) {
                        data.httpOptions.injectRequestHeaders.forEach(
                            ([name, value]) => Header.new(name, value),
                        );
                    } else {
                        Object.entries(
                            data.httpOptions.injectRequestHeaders,
                        ).forEach(([name, value]) => Header.new(name, value));
                    }
                }

                if (data.httpOptions?.injectResponseHeaders) {
                    if (Array.isArray(data.httpOptions.injectResponseHeaders)) {
                        data.httpOptions.injectResponseHeaders.forEach(
                            ([name, value]) => Header.new(name, value),
                        );
                    } else {
                        Object.entries(
                            data.httpOptions.injectResponseHeaders,
                        ).forEach(([name, value]) => Header.new(name, value));
                    }
                }

                httpOptions.setInjectRequestHeaders(injectRequestHeaders);
                httpOptions.setInjectResponseHeaders(injectResponseHeaders);

                return ExternalServer.new()
                    .setName(data.name)
                    .setAddress(data.address)
                    .setHttp(httpOptions);
            })
            .with({ type: 'disk' }, (data) =>
                DiskService.new()
                    .setName(data.name)
                    .setPath(data.path)
                    .setWritable(data.writable ?? false)
                    .setAllowDotFiles(data.allowDotFiles ?? false),
            )
            .exhaustive();

        this.config.addService(newService);

        return newService;
    }

    private baseCreateSocket(data: {
        name: string;
        address: string;
        service: Service;
    }) {
        const newSocket = Socket.new()
            .setName(data.name)
            .setAddress(data.address)
            .setService(ServiceDesignator.new(data.service._name));

        this.config.addSocket(newSocket);

        return newSocket;
    }

    private initializeRouter(opts: { listenAddress: string }) {
        this.routerMeta.id = this.workerId;
        this.listenAddress = opts.listenAddress;

        const routerWorker = this.baseCreateWorker({
            name: 'defaultRouter',
            modules: [
                {
                    type: 'esmodule',
                    fileContent: router,
                    fileName: 'index.js',
                    importName: 'index.js',
                },
            ],
            bindings: [
                {
                    type: 'json',
                    name: '__meta',
                    value: this.routerMeta,
                },
            ],
        });

        const routerService = this.baseCreateService({
            type: 'worker',
            worker: routerWorker,
        });

        this.baseCreateSocket({
            address: opts.listenAddress,
            name: 'defaultRouterSocket',
            service: routerService,
        });

        return routerWorker;
    }

    private addWorkerRouterReference(
        worker: WorkerDefinition,
        service: Service,
        meta: {
            host: string;
            paths: string[];
        },
    ) {
        this.routerMeta.routes.push({
            host: meta.host,
            paths: meta.paths,
            service: worker._name,
        });

        let router = this.config.worker('defaultRouter');

        if (!router) {
            router = this.initializeRouter({
                listenAddress: this.listenAddress,
            });
        }

        this.baseUpsertBinding(router, '__meta', {
            type: 'json',
            name: '__meta',
            value: this.routerMeta,
        });

        this.baseAddBinding(router, {
            type: 'service',
            name: worker._name,
            service: service,
        });
    }

    private getRouterService() {
        let service = this.config._services.find(
            (service) => service._name === 'defaultRouter',
        );

        if (!service) {
            throw new Error(
                'Router service does not exist. This should _never_ happen.',
            );
        }

        return service;
    }

    private getRouterSocket() {
        let socket = this.config._sockets.find(
            (socket) => socket._name === 'defaultRouterSocket',
        );

        if (!socket) {
            throw new Error(
                'Router socket does not exist. This should _never_ happen.',
            );
        }

        return socket;
    }

    private initializeAdminApiService(opts: { adminApiAddress: string }) {
        const existingService = this.config._services.find(
            (service) => service._name === 'defaultAdminApiService',
        );

        if (existingService) {
            return existingService;
        }

        return this.baseCreateService({
            type: 'external',
            address: opts.adminApiAddress,
            name: 'defaultAdminApiService',
            httpOptions: {
                type: 'proxy',
            },
        });
    }

    private getAdminApiService() {
        let service = this.config._services.find(
            (service) => service._name === 'defaultAdminApiService',
        );

        if (!service) {
            service = this.initializeAdminApiService({
                adminApiAddress: this.adminApiAddress,
            });
        }

        return service;
    }

    public static new(opts: {
        workerId: string;
        listenAddress: string;
        adminApiAddress: string;
    }) {
        const configurator = new Configurator();

        configurator.setWorkerId(opts.workerId);

        configurator.initializeRouter({
            listenAddress: opts.listenAddress,
        });
        configurator.initializeAdminApiService({
            adminApiAddress: opts.adminApiAddress,
        });

        configurator.setListenAddress(opts.listenAddress);
        configurator.setAdminApiAddress(opts.adminApiAddress);

        return configurator;
    }

    public setRouterAddress(address: string) {
        const routerSocket = this.getRouterSocket();

        routerSocket.setAddress(address);

        return this;
    }

    public setAdminAddress(address: string) {
        const adminApiService = this.getAdminApiService();

        if (!(adminApiService instanceof ExternalServer)) {
            throw new Error(
                'Admin API service is not an external server. This should _never_ happen.',
            );
        }

        adminApiService.setAddress(address);

        return this;
    }

    public addWorker(_worker: {
        name: string;
        compatibilityDate?: string;
        modules: {
            importName: string;
            fileName: string;
            fileContent: string | DataView;
            type: 'esmodule' | 'wasm' | 'json' | 'text' | 'data';
        }[];
        routing: {
            host: string;
            basePaths: string[];
        }[];
        bindings: BaseBindingData[];
    }) {
        const adjustedWorker = produce(_worker, (draft) => {
            draft.modules[0].importName = './_entrypoint.js';
            draft.modules.unshift({
                type: 'esmodule',
                fileContent: entrypoint,
                fileName: '__yukako_entrypoint.js',
                importName: '__yukako_entrypoint.js',
            });
        });

        const worker = this.baseCreateWorker(adjustedWorker);

        const routerService = this.getRouterService();

        this.baseAddBinding(worker, {
            type: 'service',
            name: '__router',
            service: routerService,
        });

        this.baseAddBinding(worker, {
            type: 'json',
            name: '__meta',
            value: {
                id: this.workerId,
                name: _worker.name,
            },
        });

        const adminApiService = this.getAdminApiService();

        this.baseAddBinding(worker, {
            type: 'service',
            name: '__admin',
            service: adminApiService,
        });

        const service = this.baseCreateService({
            type: 'worker',
            worker: worker,
        });
        _worker.routing.forEach((route) => {
            this.addWorkerRouterReference(worker, service, {
                host: route.host,
                paths: route.basePaths,
            });
        });

        return this;
    }

    public writeConfig(_path: string) {
        const dir = path.dirname(_path);
        const artifactsDir = path.join(dir, 'artifacts');
        fs.ensureDirSync(artifactsDir);
        this.artifacts.writeFiles(artifactsDir);

        const workerConfig = this.config.render();
        fs.writeFileSync(_path, workerConfig);
    }
}