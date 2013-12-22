/**
 * tequila
 * bootstrap3-panels-test.js
 */
test.runnerBootstrap3Interface = function () {
  test.heading('Bootstrap3PanelInterface', function () {
    test.paragraph('Bootstrap3PanelInterface Interface is a single column panel oriented interface for cell / tablet / desktop.');
    test.heading('Interface tests are applied.', function () {
      test.runnerInterfaceMethodsTest(Bootstrap3PanelInterface,true);
    });
  });
};
