
using Workerd = import "/workerd/workerd.capnp";

const config :Workerd.Config = (
	services = [
        (
        	name = "defaultRouter",
        	worker = .defaultRouter
        ), (
        	name = "defaultAdminApiService",
        	external = (
        	    address = "unix:/Users/julian/yukako/testworker/.yukako_cli/admin/admin.sock",
        	    http = (
                    style = host,
                    injectRequestHeaders = [
                            
                    ],
                    injectResponseHeaders = [
                            
                    ]
                )
        	)
        ), (
        	name = "devworker908",
        	worker = .devworker908
        )
    ],
	sockets = [
        (
            name = "defaultRouterSocket",
        	address = "unix:/Users/julian/yukako/testworker/.yukako_cli/engine/engine.sock",
        	http = (),
        	service = "defaultRouter"
        )
    ],
	extensions = [
        (
        	modules = [
                (
                	name = "kv-extension",
                	internal = true,
                	esModule = embed "artifacts/__yukako_internal_extensions/kv-extension-module.js"
                )
        	]
        ), (
        	modules = [
                (
                	name = "sites-extension",
                	internal = true,
                	esModule = embed "artifacts/__yukako_internal_extensions/sites-extension-module.js"
                )
        	]
        )
    ],
);

const defaultRouter :Workerd.Worker = (
    modules = [
        ( name = "index.js", esModule = embed "artifacts/defaultRouter/index.js" )
    ],
    compatibilityDate = "2023-01-01",
    compatibilityFlags = [
        
    ],
    bindings = [
        (
            name = "__meta",
            json = "{\"routes\":[{\"host\":\"localhost\",\"paths\":[\"/\",\"/test\"],\"service\":\"devworker908\"}],\"id\":\"dev-worker\"}"
        ), (
            name = "devworker908",
            service = "devworker908"
        )
    ]
);

const devworker908 :Workerd.Worker = (
    modules = [
        ( name = "__yukako_entrypoint.js", esModule = embed "artifacts/devworker908/__yukako_entrypoint.js" ),
        ( name = "./_entrypoint.js", esModule = embed "artifacts/devworker908/4d87d1ced93f4fe8d0a81cf86c3929272dd0e484d5c4c1db9386c2cb02f4841f" )
    ],
    compatibilityDate = "2023-01-01",
    compatibilityFlags = [
        
    ],
    bindings = [
        (
            name = "__router",
            service = "defaultRouter"
        ), (
            name = "__meta",
            json = "{\"id\":\"dev-worker\",\"name\":\"dev-worker\"}"
        ), (
            name = "__admin",
            service = "defaultAdminApiService"
        )
    ]
);
