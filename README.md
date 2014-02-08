# tequila [![Build Status](https://secure.travis-ci.org/dremoor/tequila.png)](http://travis-ci.org/dremoor/tequila) 
Tequila is a javascript application framework.  It runs on node server,  modern browsers and as phonegap apps.

## Project Goals:

* Provide high level abstractions to simplify application development
* Facilitate design pattern practices
* Adherence to test driven design and development
* Utilize 3rd party libraries but provide facades and adapters to keep the app simple, flexible and extensible

####Sample app
http://dremoor.github.io/tequila/samples/bootstrap3-panels-interface-sample/

####Specs, Docs, & Tests
http://dremoor.github.io/tequila/test-spec/test-runner

## Install
- git it
- npm install it
- make it

#### To do now
- Finish Login in interface sample
- Workspace Integration

#### To do later
- add get and put methods to Model
- include google toolchain for chrome apps and bundles (cell,osx,...)
- Review callback for consistency.  err, xxx like node?
- Make validation rules for attributes.  Built in such as range, required, type specific, ..., finally js callback
- Make validation for model in conjunction with attributes - extend current validation to code and rule based
- Attribute image type
- tequilaStore needs to be set not hard coded (mongo)
- Attribute visible property
- Improve Session to handle server side auth on store
- Add authentication to Store via sessions

#### To do even later
- Why is Travis breaking JSONfilestore ?
- Fix test rig async assertions getting intermixed need state per node instead of global
- create redis-store
- create package-store (sound, image, pdf, misc subclass resource-class make attribute type)
- Use confess / phantomJS to make cache manifest

#### Uncertain
- make remote command type or flag as remote ? or just do it automatically if not handled locally ?
- Make easier way to retrieve single model findModel()
- Command class functions should not need to call this.complete() ... should be automatic?
- Don't store nulls in stores just do by inference (have get populate on return and put remove before inserting)
