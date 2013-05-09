all: test

test: make.test
	@bin/tequila test

make.test: make.lib test-spec/node-test-runner.js

test-spec/node-test-runner.js: test-spec/node-test-header.js test-spec/test-runner.js test-spec/tequila-spec.js test-spec/node-test-tail.js test-spec/Markdown.Converter.js
	@echo building test-spec/node-test-runner.js...
	@echo '// FILE IS DESTROYED AND REBUILT IN MAKE' > test-spec/node-test-runner.js
	@cat \
	    test-spec/Markdown.Converter.js \
	    tequila.js \
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
        test-spec/integration/test-store-integration.js \
        test-remoteStore-integration \
	    test-spec/tequila-spec.js \
	    test-spec/node-test-tail.js \
	        >> test-spec/node-test-runner.js

make.lib:
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
	        >> tequila.js

