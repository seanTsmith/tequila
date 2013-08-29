/**
 * tequila
 * procedure-test
 */
test.runnerProcedure = function () {
  test.heading('Procedure Class', function () {
    test.paragraph('The procedure class manages multiple commands and functions.');
    test.xexample('', false, function () {
      /* TODO
       PROPERTIES
         steps - An array of commands or function callbacks
         beginProcedure - callback called before first step executed
         beginStep - callback is executed before each step
         endStep - callback is executed after each step
         endProcedure - callback called after last step executed
         abortProcedure - callback called when procedure aborted - should clean up resources

       METHODS
         execute -
         abort -


       */
    });
  });
};