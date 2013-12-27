/**
 * tequila
 * test-procedure-integration
 */
test.runnerProcedureIntegration = function () {
  test.heading('Procedure Integration', function () {
    test.example('synchronous sequential tasks are the default when tasks has no requires property', test.asyncResponse('abc123'), function (testNode, returnResponse) {
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
    test.example('async tasks are designated when requires is set to null', test.asyncResponse('eenie meenie miney mo'), function (testNode, returnResponse) {
      var cmd = new Command({name: 'cmdProcedure', type: 'Procedure', contents: new Procedure({tasks: [
        {
          command: new Command({
            type: 'Function',
            contents: function () {
              var self = this;
              setTimeout(function () {
                self._parentProcedure.bucket += ' mo';
                self.complete();
              }, 500); // This will be done last
            }
          })
        },
        {
          requires: null, // no wait to run this
          command: new Command({
            type: 'Function',
            contents: function () {
              this._parentProcedure.bucket += ' miney';
              this.complete();
            }
          })
        }
      ]})});
      cmd.onEvent('*', function (event) {
        if (event == 'Completed') returnResponse(testNode, cmd.bucket);
      });
      cmd.bucket = 'eenie meenie';
      cmd.execute();
    });
    test.example('this example shows multiple dependencies', test.asyncResponse('todo: drugs sex rock & roll'), function (testNode, returnResponse) {
      var cmd = new Command({name: 'cmdProcedure', type: 'Procedure', contents: new Procedure({tasks: [
        {
          command: new Command({
            type: 'Function',
            contents: function () {
              var self = this;
              setTimeout(function () {
                self._parentProcedure.bucket += ' rock';
                self.complete();
              }, 300);
            }
          })
        },
        {
          requires: null, // no wait to run this
          label: 'sex',
          command: new Command({
            type: 'Function',
            contents: function () {
              var self = this;
              setTimeout(function () {
                self._parentProcedure.bucket += ' sex';
                self.complete();
              }, 200);
            }
          })
        },
        {
          requires: null, // no wait to run this
          label: 'drugs',
          command: new Command({
            type: 'Function',
            contents: function () {
              var self = this;
              setTimeout(function () {
                self._parentProcedure.bucket += ' drugs';
                self.complete();
              }, 100);
            }
          })
        },
        {
          requires: ['sex', 'drugs', 0], // need these labels and array index 0
          command: new Command({
            type: 'Function',
            contents: function () {
              this._parentProcedure.bucket += ' & roll';
              this.complete();
            }
          })
        }
      ]})});
      cmd.onEvent('*', function (event) {
        if (event == 'Completed') returnResponse(testNode, cmd.bucket);
      });
      cmd.bucket = 'todo:';
      cmd.execute();
    });
  });
};
