/**
 * tequila
 * transport-test
 */

test.runnerTransport = function () {
  test.heading('Transport Class', function () {
    if (typeof io == 'undefined') {
      test.examplesDisabled = true;
      test.paragraph('tests disabled socket.io not detected');
    }
    test.paragraph('Handle message passing between host and UI.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Transport', true, function () {
        return new Transport("*wtf*", function () {
        }) instanceof Transport;
      });
      test.example('must be instantiated with new', Error('new operator required'), function () {
        Transport("", function () {
        });
      });
      test.example('must pass url string', Error('argument must a url string'), function () {
        new Transport();
      });
      test.paragraph('The callback processes incoming messages and errors.' +
        '  Further details on usage can ben seen in integration tests.');
      test.example('must pass callback function', Error('argument must a callback'), function () {
        new Transport('');
      });
      test.example('url must be valid', test.asyncResponse('Error Message: cannot connect'), function (testNode, returnResponse) {
        new Transport('*url*', function (message) {
          returnResponse(testNode, message);
        }, this);
      });
    });
    test.heading('METHODS', function () {
      test.heading('send(message)', function () {
        test.paragraph('send() is used to send messages to host or UI.  Any errors returned are based on state checks' +
          ' and not resulting from async errors.' +
          ' If confirmation is needed provide callback to notify message has been sent or error has occurred.');
        test.example('message param required', Error('message required'), function () {
          new Transport("", function () {
          }).send();
        });
        test.example('message param must be type Message', Error('parameter must be instance of Message'), function () {
          new Transport("", function () {
          }).send('money');
        });
        test.example('Transport must be connected (async error message)', test.asyncResponse('Error Message: not connected'), function (testNode, returnResponse) {
          new Transport("*bad*", function () {
            this.send(new Message('Null'), function (msg) {
              returnResponse(testNode, msg);
            });
          });
        });
        test.example('optional callback must be function', Error('argument must a callback'), function () {
          new Transport("", function () {
          }).send(new Message('Null'), Infinity);
        });
        test.example('if callback used messages sent are acknowledged', test.asyncResponse('Ack'), function (testNode, returnResponse) {
          test.hostStore.transport.send(new Message('Null'), function (msg) {
            returnResponse(testNode, msg);
          });
        });
      });
      test.heading('close()', function () {
        test.xexample('Transport must be connected (async error message)', test.asyncResponse('jobs done'), function (testNode, returnResponse) {
          new Transport("", function () {
            this.close(); // TODO can't open 2 transports to same URL so can't test this since it conflicts with hostStore
            returnResponse(testNode, "jobs done");
          });
        });
      });
    });
    test.examplesDisabled = false;
  });
};
