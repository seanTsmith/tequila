/**
 * tequila
 * mock-test.js
 */
test.runnerMockInterface = function () {
  test.heading('MockInterface', function () {
    test.paragraph('Mock Interface provides a headless interface with full mocking capability.');
    test.heading('Interface tests are applied.', function () {
      test.runnerInterfaceMethodsTest(MockInterface,true);
    });
  });
};
