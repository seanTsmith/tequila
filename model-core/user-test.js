/**
 * tequila
 * user-test
 */
test.runnerUserModel = function () {
  test.heading('User Core Model', function () {
    test.example('objects created should be an instance of User', true, function () {
      return new User() instanceof User;
    });
    test.heading('Model tests are applied', function () {
      test.runnerModel(User,true);
    });
  });
};


//// Spec for tgi-user
//define(function (require) {
//  moduleDefined('/test-spec/test-model-user.js');
//  var should = require("../node_modules/chai/chai.js").should();
//  var User = require("../model-lib/tgi-model-user");
//  var Model = require("../class-lib/tgi-class-model");
//  var modelTest = require('./../class-test/test-class-model');
//  return {
//    test: function (showTestModelDetail) {
//      describe('User Model', function () {
//        describe('Model() tests for User', function () {
//          modelTest.testModel("User", "../model-lib/tgi-model-user",showTestModelDetail);
//        });
//        describe('New instances of Model', function () {
//          it('objects created should be an instance of User', function () {
//            new User().should.be.an.instanceOf(User);
//          });
//        });
//      });
//    }
//  }
//});
