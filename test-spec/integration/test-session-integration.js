/**
 * tequila
 * test-session-integration
 */
test.runnerSessionIntegration = function () {
  test.heading('INTEGRATION TEST', function () {
    test.example('simulate logging in etc', test.asyncResponse(true), function (testNode, returnResponse) {

      var self = this;
      var store = new MemoryStore();
      var session1 = new Session();
      var session2 = new Session();

      var user1 = new User(), name1 = 'jack', pass1 = 'wack', ip1 = '123';
      user1.set('name', name1);
      user1.set('password', pass1);
      user1.set('active', true);

      var user2 = new User(), name2 = 'jill', pass2 = 'pill', ip2 = '456';
      user2.set('name', name2);
      user2.set('password', pass2);
      user2.set('active', true);

      // start with empty store and add some users
      store.putModel(user1, userStored);
      store.putModel(user2, userStored);


      // callback after users stored
      function userStored(model, error) {
        if (typeof error != 'undefined') {
          returnResponse(testNode, error);
          return;
        }
        if (user1.get('id') && user2.get('id')) {
          // users added to store now log them both in and also generate 2 errors
          self.goodCount = 0;
          self.badCount = 0;
          session1.startSession(store, name1, 'badpassword', ip1, usersStarted);
          session1.startSession(store, name1, pass1, ip1, usersStarted);
          session2.startSession(store, 'john', pass2, ip2, usersStarted);
          session2.startSession(store, name2, pass2, ip2, usersStarted);
        }
      }

      // callback after session started called
      function usersStarted(err, session) {
        if (err)
          self.badCount++;
        else
          self.goodCount++;

        if (self.badCount == 2 && self.goodCount == 2) {
          // Resume session1 correctly
          new Session().resumeSession(store, ip1, session1.get('passCode'), sessionResumed_Test1);
        }
      }
      function sessionResumed_Test1(err, session) {
        if (err)
          returnResponse(testNode, Error('sessionResumed_Test1 failed'));
        else
        // Resume session2 with wrong passcode
          new Session().resumeSession(store, ip2, 'no more secrets', sessionResumed_Test2);
      }
      function sessionResumed_Test2(err, session) {
        if (err)
        // Resume session2 correctly now after failing
          new Session().resumeSession(store, ip2, session2.get('passCode'), sessionResumed_Test3);
        else
          returnResponse(testNode, Error('sessionResumed_Test2 failed'));
      }
      function sessionResumed_Test3(err, session) {
        if (err)
          returnResponse(testNode, Error('sessionResumed_Test3 failed:  ' + err));
        else
        // Now we end this session
          session.endSession(store, function (err, session) {
            if (err)
              returnResponse(testNode, Error('session.endSession failed: '+err));
            else
            // Now try restoring again and it should fail
              new Session().resumeSession(store, ip2, session2.get('passCode'), sessionResumed_Test4);
          });
      }
      function sessionResumed_Test4(err, session) {
        if (err)
          returnResponse(testNode, Error('sessionResumed_Test4 failed'));
        else
          returnResponse(testNode, true);
      }
    });
  });
};