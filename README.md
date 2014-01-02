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
- Make session method endSession and add to integration test
- Command class functions should not need to call this.complete() ... should be automatic?
- Make easier way to retrieve single model findModel()
- getlist needs next item to detect end ? or need hasMoreItems ?
- model.set({name:value}) should be like model.set('name',value})
- make validation for types
- have stores validate before saving
- fix Test variations on getList method test for remote stores

#### To do later
- Don't store nulls in stores just do by inference (have get populate on return and put remove before inserting)
- tequilaStore needs to be set not hard coded
- Attribute image type
- Attribute visible property
- make remote command type or flag as remote ? or just do it automatically if not handled locally ?

#### To do even later
- create redis-store
- create json-file-store
- create package-store (sound, image, pdf, misc subclass resource-class make attribute type)
- Use confess / phantomJS to make cache manifest

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/dremoor/tequila/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
