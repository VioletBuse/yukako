
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
        	name = "devworker240",
        	worker = .devworker240
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
            json = "{\"routes\":[{\"host\":\"*\",\"paths\":[\"/\",\"/test\"],\"service\":\"devworker240\"}],\"id\":\"dev-worker\"}"
        ), (
            name = "devworker240",
            service = "devworker240"
        )
    ]
);

const devworker240 :Workerd.Worker = (
    modules = [
        ( name = "__yukako_entrypoint.js", esModule = embed "artifacts/devworker240/__yukako_entrypoint.js" ),
        ( name = "./_entrypoint.js", esModule = embed "artifacts/devworker240/4d87d1ced93f4fe8d0a81cf86c3929272dd0e484d5c4c1db9386c2cb02f4841f" )
    ],
    compatibilityDate = "2023-01-01",
    compatibilityFlags = [
        
    ],
    bindings = [
        (
        	name = "KV_DATABASE",
        	wrapped = (
        	    moduleName = "kv-extension",
        	    entrypoint = "default",
        	    innerBindings = [
                    (
                        name = "KV_DB_ID",
                        text = "PntF9VlSKBqP386sQIrUD"
                    ),
                    (
                        name = "__admin",
                        service = "defaultAdminApiService"
                    )
        	    ]
        	)
        ), (
        	name = "SITE",
        	wrapped = (
        	    moduleName = "sites-extension",
        	    entrypoint = "default",
        	    innerBindings = [
                    (
                        name = "/index.html",
                        data = embed "artifacts/__yukako_data_binding_data/d36905b0cdd17b27f336d38539aed3f50f45db5a2fb546bc743e5905a7df97b5"
                    ),
                    (
                        name = "/public/index.css",
                        data = embed "artifacts/__yukako_data_binding_data/8e13c859a7208441d17d31ea5bfaabeccae00c93d6fd3144543d979540f84359"
                    )
        	    ]
        	)
        ), (
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
