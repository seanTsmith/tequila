/**
 * tequila
 * Request-test
 */
test.runnerRequest = function () {
  test.heading('Request Class', function () {
    test.paragraph('Requests handle the Request / Response design pattern.  They are used by the Interface class to ' +
      'communicate with the Application Model');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Request', true, function () {
        return new Request('Null') instanceof Request;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Request('Null');
      });
      test.example('request type must be specified', Error('Request type required'), function () {
        new Request();
      });
      test.example('simple string parameter creates request of named type', 'example', function () {
        return new Request('example').type;
      });
      test.example('type can be specified when object passed', 'example', function () {
        return new Request({type: 'example'}).type;
      });
      test.example('Command type requests expect contents to contain a command object', Error('command object required'), function () {
        return new Request({type: 'Command'});
      });
      test.example('correct version', 'Command Request: Stub Command: (unnamed)', function () {
        return new Request({type: 'Command', command: new Command()});
      });
    });
    test.heading('METHODS', function () {
      test.heading('toString()', function () {
        test.example('should return a description of the Request', 'Null Request', function () {
          return new Request('Null').toString();
        });
      });
    });
  });
};