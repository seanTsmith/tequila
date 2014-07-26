/**
 * tequila
 * framework7-interface-test
 */
test.runnerFramework7Interface = function () {
  test.heading('Framework7Interface', function () {
    test.paragraph('Framework7Interface Interface is a ios7 like UI.');
    test.heading('Interface tests are applied.', function () {
      test.runnerInterfaceMethodsTest(Framework7Interface,true);
    });
  });
};
