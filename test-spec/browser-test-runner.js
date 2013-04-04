test.start();
//test.heading('TEQUILA TEST SPEC', function () {
//
//  test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
//  test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
//  test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
//  test.example('Uno', function () {
//    // First
//    return 1;
//  });
//  test.example('Dos', function () {
//    // Second
//    return 2;
//  });
//  test.heading('HEADING LEVEL 2', function () {
//    test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
//    test.example('three', function () {
//      // meh
//    });
//    test.heading('HEADING LEVEL 3', function () {
//      test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
//      test.heading('HEADING LEVEL 4', function () {
//        test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
//        test.heading('HEADING LEVEL 5', function () {
//          test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
//          test.heading('HEADING LEVEL 6', function () {
//            test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
//            test.example('bbb', function () {
//              // this sample code here
//              var something = 'asdasdasd';
//              var nothing;
//              if (something == nothing) {
//                console.log("well isn't that special, ok listen this code is long enought to show what margin is needed at most ok???");
//              }
//            });
//          });
//        });
//      });
//    });
//  });
//  test.paragraph("This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.")
//  test.heading('PEACE', function () {
//    test.example('PIPE');
//  });
//  test.paragraph("This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.")
//  test.example('aaa');
//  test.paragraph("This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.")
//  test.example('bbb', function () {
//    // this example is a bb
//    var x1 = 1;
//    var x2 = 2;
//    // cool
//    x1 = x2/0;
//  });
//
//
//});
test.heading('TEQUILA TEST SPEC', function () {
  test.example('Rule the world');
  test.example('return 1', 1, function () {
    // Best test ever
    return 1;
  });
  test.example('divide by zero', 'spanish inquisition', function () {
    // Fail on purpose
    return 1/0;
  });
  test.xexample('answer to the universe', 'fix this someday', function () {
    return (6((1/0)-(1/0))^2)/(((1/0)^(1/0))/7);
  });
  test.example('expect nothing to be undefined', ReferenceError('nothing is not defined') , function () {
    return nothing;
  });
});
test.stop();
test.render();
