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
      test.example('url must be valid', test.AsyncResponse(Error('cannot connect')), function (testNode, returnResponse) {
        new Transport('*url*', function (messageType, messageContents, err) {
          if (err) {
            returnResponse(testNode, err);
          } else {
            returnResponse(testNode, messageType);
          }
        }, this);
      });
    });
    test.heading('METHODS', function () {
      test.heading('', function () {
      });
    });
    test.examplesDisabled = false;
  });
};
