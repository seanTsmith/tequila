/**
 * tequila
 * transport-test
 */

test.runnerTransport = function () {
  test.heading('Transport Class', function () {
    test.paragraph('Handle message passing');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Transport', true, function () {
        return new Transport("null:", function () {
        }) instanceof Transport;
      });
      test.example('must be instantiated with new', Error('new operator required'), function () {
        Transport("", function () {
        });
      });
      test.example('must pass url string', Error('argument must a url string'), function () {
        new Transport();
      });
      test.example('must pass callback function', Error('argument must a callback'), function () {
        new Transport('');
      });
      test.example('must pass callback function', Error('argument must a callback'), function () {
        new Transport('');
      });
      test.example('url must be valid', test.AsyncResponse(true), function (testNode, returnResponse) {
        new Transport('', function (messageType, messageContents, err) {
          if (err) {
            returnResponse(testNode, err);
          } else {
            returnResponse(testNode, messageType);
          }
        },this);
      });
    });
  });
};