
using Workerd = import "/workerd/workerd.capnp";

const config: Workerd.Config = (
	services = [
        (
        	name = "defaultRouter",
        	worker = .defaultRouter
        ), (
        	name = "defaultAdminApiService",
        	external = (
        	    address = "unix:/Users/julian/yukako/apps/server/.yukako/1/admin/admin.sock",
        	    http = (
                    style = proxy,
                    injectRequestHeaders = [
                            
                    ],
                    injectResponseHeaders = [
                            
                    ]
                )
        	)
        ), (
        	name = "test",
        	worker = .test
        ), (
        	name = "newproject",
        	worker = .newproject
        )
    ],
	sockets = [
        (
            name = "defaultRouterSocket",
        	address = "unix:/Users/julian/yukako/apps/server/.yukako/1/engine/engine.sock",
        	http = (),
        	service = "defaultRouter"
        )
    ],
	extensions = [
        
    ],
);

const defaultRouter: Workerd.Worker = (
    modules = [
        ( name = "index.js", esModule = embed "artifacts/defaultRouter/index.js" )
    ],
    compatibilityDate = "2023-01-01",
    compatibilityFlags = [
        
    ],
    bindings = [
        (
            name = "test",
            service = "test"
        ), (
            name = "__meta",
            json = "{\"routes\":[{\"host\":\"test.localhost:8080\",\"paths\":[],\"service\":\"test\"},{\"host\":\"newproject.localhost:8080\",\"paths\":[],\"service\":\"newproject\"}],\"id\":\"1\"}"
        ), (
            name = "newproject",
            service = "newproject"
        )
    ]
);

const test: Workerd.Worker = (
    modules = [
        ( name = "__yukako_entrypoint.js", esModule = embed "artifacts/test/__yukako_entrypoint.js" ),
        ( name = "./_entrypoint.js", esModule = embed "artifacts/test/8bfeb9d63eaf44813cf344ff43f277c71a72c744bbf9ce3a9b90bebf26ddf103" )
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
            json = "{\"id\":\"1\",\"name\":\"test\"}"
        ), (
            name = "__admin",
            service = "defaultAdminApiService"
        )
    ]
);

const newproject: Workerd.Worker = (
    modules = [
        ( name = "__yukako_entrypoint.js", esModule = embed "artifacts/newproject/__yukako_entrypoint.js" ),
        ( name = "./_entrypoint.js", esModule = embed "artifacts/newproject/1d071e9c3096f4c66a75a050a0e8e78433e84fad74842366a44a51336a32e2fb" ),
        ( name = "jsonbinding.json", json = embed "artifacts/newproject/1fe695a87d7d5d2c0d319806ab9a344b601dab900ba0bfe981531181b535ab8a" ),
        ( name = "yukako.json", json = embed "artifacts/newproject/1302adfb50469d6f0a398c0e049ec3b54aa1aec93fce00c35d761b5490c17367" )
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
            json = "{\"id\":\"1\",\"name\":\"newproject\"}"
        ), (
            name = "__admin",
            service = "defaultAdminApiService"
        )
    ]
);
