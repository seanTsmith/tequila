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
        model-core/mongo-store-model-server.js \
	    test-spec/node-test-header.js \
	    test-spec/test-runner.js \
        class-lib/tequila-test.js \
        class-lib/message-test.js \
        class-lib/transport-test.js \
        class-lib/attribute-test.js \
        class-lib/model-test.js \
        class-lib/list-test.js \
        model-core/user-test.js \
        model-core/store-test.js \
        model-core/memory-store-test.js \
        model-core/remote-store-test.js \
        model-core/mongo-store-test.js \
        test-spec/integration/test-list-integration.js \
        test-spec/integration/test-store-integration.js \
	    test-spec/tequila-spec.js \
	    test-spec/node-test-tail.js \
	        >> node-test-cli.js

make.lib:
	@echo Making library
	@echo '// FILE IS DESTROYED AND REBUILT IN MAKE' > tequila.js
	@cat \
	    class-lib/tequila-class.js \
	    class-lib/transport-class.js \
        class-lib/message-class.js \
        class-lib/attribute-class.js \
        class-lib/model-class.js \
        class-lib/list-class.js \
        model-core/user-model.js \
        model-core/store-model.js \
        model-core/memory-store-model.js \
        model-core/remote-store-model.js \
        model-core/mongo-store-model.js \
	        >> tequila.js

	@echo '// FILE IS DESTROYED AND REBUILT IN MAKE' > node-test-host.js
	@cat \
        tequila.js \
        model-core/mongo-store-model-server.js \
        test-spec/test-runner-node-server.js \
	        >> node-test-host.js
