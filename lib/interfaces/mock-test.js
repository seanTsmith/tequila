/**
 * tequila
 * mock-test.js
 */
test.runnerMockInterface = function () {
  test.heading('MockInterface', function () {
    test.paragraph('The Interface Class is an abstraction of a user interface.');
    test.runnerInterfaceMethodsTest(MockInterface);
  });
};
MockInterface.prototype = T.inheritPrototype(Interface.prototype);
