module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';\n'
      },
      tequila: {
        src: [
          'lib/classes/tequila-singleton.js',

          'lib/classes/attribute-class.js',
          'lib/classes/command-class.js',
          'lib/classes/delta-class.js',
          'lib/classes/interface-class.js',
          'lib/classes/list-class.js',
          'lib/classes/message-class.js',
          'lib/classes/model-class.js',
          'lib/classes/procedure-class.js',
          'lib/classes/request-class.js',
          'lib/classes/store-class.js',
          'lib/classes/transport-class.js',

          'lib/models/application-model.js',
          'lib/models/log-model.js',
          'lib/models/presentation-model.js',
          'lib/models/user-model.js',
          'lib/models/session-model.js',
          'lib/models/workspace-model.js',

          'lib/stores/memory-store.js',
          'lib/stores/mongo-store.js',
          'lib/stores/json-file-store.js',
          'lib/stores/remote-store.js',
          'lib/stores/local-store.js',
          'lib/stores/redis-store.js',

          'lib/interfaces/bootstrap3-panels-interface.js',
          'lib/interfaces/framework7-interface.js',
          'lib/interfaces/command-line-interface.js',
          'lib/interfaces/mock-interface.js'
        ],
        dest: 'dist/tequila.js'
      },
      nodeTestCli: {
        src: [
          'test-spec/Markdown.Converter.js',
          'dist/tequila.js',
          'lib/stores/mongo-store-server.js',
          'lib/stores/json-file-server.js',
          'test-spec/node-test-header.js',
          'test-spec/test-runner.js',

          'test-spec/test-cover-head.txt',

          'lib/classes/attribute-test.js',
          'lib/classes/command-test.js',
          'lib/classes/delta-test.js',
          'lib/classes/interface-test.js',
          'lib/classes/list-test.js',
          'lib/classes/message-test.js',
          'lib/classes/model-test.js',
          'lib/classes/procedure-test.js',
          'lib/classes/request-test.js',
          'lib/classes/store-test.js',
          'lib/classes/tequila-test.js',
          'lib/classes/transport-test.js',

          'lib/models/application-test.js',
          'lib/models/log-test.js',
          'lib/models/presentation-test.js',
          'lib/models/user-test.js',
          'lib/models/session-test.js',
          'lib/models/workspace-test.js',


          'lib/stores/memory-test.js',
          'lib/stores/mongo-test.js',
          'lib/stores/json-file-test.js',
          'lib/stores/remote-test.js',
          'lib/stores/local-test.js',
          'lib/stores/redis-test.js',

          'lib/interfaces/bootstrap3-panels-test.js',
          'lib/interfaces/framework7-interface-test.js',
          'lib/interfaces/command-line-test.js',
          'lib/interfaces/mock-test.js',
          'test-spec/integration/test-list-integration.js',
          'test-spec/integration/test-session-integration.js',
          'test-spec/integration/test-interface-integration.js',
          'test-spec/integration/test-store-integration.js',
          'test-spec/integration/test-command-integration.js',
          'test-spec/integration/test-procedure-integration.js',
          'test-spec/integration/test-application-integration.js',
          'test-spec/integration/test-request-dispatch-integration.js',

          'test-spec/test-cover-tail.txt',

          'test-spec/tequila-spec.js',
          'test-spec/node-test-tail.js'
        ],
        dest: 'dist/node-test-cli.js'
      },
      nodeTestHost: {
        src: [
          'dist/tequila.js',
          'lib/stores/mongo-store-server.js',
          'lib/stores/json-file-store-server.js',
          'test-spec/test-runner-node-server.js'
        ],
        dest: 'dist/node-test-host.js'
      }
    },
    uglify:{
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'dist/tequila.min.js': ['dist/tequila.js']
        }
      }
    }
  });

  // node dist/node-test-cli.js
  grunt.registerTask('test', function () {
    var done = this.async();
//    doneFunction = function (error, result, code) {
//      grunt.log.write(error);
//      grunt.log.write(result);
//      grunt.log.write(code);
//      return done();
//    };
    var child = grunt.util.spawn(
      {
        cmd: process.argv[0],
        args: ['dist/node-test-cli.js']
      }, done);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    return child;
  });

  // istanbul cover dist/node-test-cli.js
  grunt.registerTask('coverme', function () {
    var done = this.async();
    var child = grunt.util.spawn(
      {
        cmd: 'istanbul',
        args: ['cover','dist/node-test-cli.js']
      }, done);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    return child;
  });

  grunt.registerTask('helpme', function () {
    grunt.log.subhead('GRUNT TASKS FOR TEQUILA\n');
    grunt.log.writeln('make\t(default) make library and run tests');
    grunt.log.writeln('cover\tgenerate coverage report');
  });

  // tasks are ...
  grunt.log.write('Grunt ...\n');
//  grunt.log.muted = true; // too spammy
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('cover', ['coverme']);
  grunt.registerTask('help', ['helpme']);
  grunt.registerTask('default', ['concat', 'uglify', 'test']);
  grunt.registerTask('make', ['concat', 'uglify', 'test']);
};