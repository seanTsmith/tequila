/**
 * tequila
 * test-procedure-integration
 */
test.runnerProcedureIntegration = function () {
  test.heading('Procedure Integration', function () {
    test.example('synchronous sequential tasks are the default when tasks has no', test.asyncResponse('abc123'), function (testNode, returnResponse) {
      var cmd = new Command({name: 'cmdProcedure', type: 'Procedure', contents: new Procedure({tasks: [
        {
          command: new Command({
            type: 'Function',
            contents: function () {
              var self = this;
              setTimeout(function () {
                self._parentProcedure.bucket += '1';
                self.complete();
              }, 250); // delayed to test that order is maintained
            }
          })
        },
        {
          command: new Command({
            type: 'Function',
            contents: function () {
              this._parentProcedure.bucket += '2';
              this.complete();
            }
          })
        },
        function () { // shorthand version of command function ...
          this._parentProcedure.bucket += '3';
          this.complete();
        }
      ]})});
      cmd.onEvent('*', function (event) {
        if (event == 'Completed') returnResponse(testNode, cmd.bucket);
      });
      cmd.bucket = 'abc';
      cmd.execute();
    });
  });
};
