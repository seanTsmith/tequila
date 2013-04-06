all: test
	@echo "Good job all your work is done, you deserve a Margerita."

test: make.test
	@bin/tequila test

make.test: make.lib test-spec/node-test-runner.js

test-spec/node-test-runner.js: test-spec/node-test-header.js test-spec/test-tequila.js test-spec/tequila-spec.js test-spec/node-test-tail.js test-spec/Markdown.Converter.js
	@echo building test-spec/node-test-runner.js...
	@echo '// FILE IS DESTROYED AND REBUILT IN MAKE' > test-spec/node-test-runner.js
	@cat \
	    test-spec/Markdown.Converter.js \
	    tequila.js \
	    test-spec/node-test-header.js \
	    test-spec/test-tequila.js \
        lib/tequila-test.js \
	    test-spec/tequila-spec.js \
	    test-spec/node-test-tail.js \
	        >> test-spec/node-test-runner.js

make.lib:
	@cat \
	    lib/tequila-class.js \
	        >> tequila.js

