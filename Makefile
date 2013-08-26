all: test

test: make.test
	@bin/tequila test

make.test: make.lib test.lib

test.lib:
	@echo building test-spec/node-test-runner.js...
	@echo '// FILE IS DESTROYED AND REBUILT IN MAKE' > node-test-cli.js
	@cat \
	    test-spec/Markdown.Converter.js \
	    tequila.js \
        lib/stores/mongo-store-server.js \
	    test-spec/node-test-header.js \
	    test-spec/test-runner.js \
        lib/classes/tequila-test.js \
        lib/classes/message-test.js \
        lib/classes/transport-test.js \
        lib/classes/attribute-test.js \
        lib/classes/model-test.js \
        lib/classes/list-test.js \
        lib/models/user-test.js \
        lib/classes/store-test.js \
        lib/stores/memory-test.js \
        lib/stores/remote-test.js \
        lib/stores/mongo-test.js \
        test-spec/integration/test-list-integration.js \
        test-spec/integration/test-store-integration.js \
	    test-spec/tequila-spec.js \
	    test-spec/node-test-tail.js \
	        >> node-test-cli.js

make.lib:
	@echo Making library
	@echo '// FILE IS DESTROYED AND REBUILT IN MAKE' > tequila.js
	@cat \
	    lib/classes/tequila-class.js \
	    lib/classes/transport-class.js \
        lib/classes/message-class.js \
        lib/classes/attribute-class.js \
        lib/classes/model-class.js \
        lib/classes/list-class.js \
        lib/classes/store-class.js \
        lib/models/user-model.js \
        lib/stores/memory-store.js \
        lib/stores/remote-store.js \
        lib/stores/mongo-store.js \
	        >> tequila.js

	@echo '// FILE IS DESTROYED AND REBUILT IN MAKE' > node-test-host.js
	@cat \
        tequila.js \
        lib/stores/mongo-store-server.js \
        test-spec/test-runner-node-server.js \
	        >> node-test-host.js
