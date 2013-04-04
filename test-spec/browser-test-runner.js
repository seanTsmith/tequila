test.start();
test.heading('TEQUILA TEST SPEC', function () {

  test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
  test.example('Uno', function () {
    // First
  });
  test.example('Dos', function () {
    // Second
  });
  test.heading('HEADING LEVEL 2', function () {
    test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
    test.example('three', function () {
      // meh
    });
    test.heading('HEADING LEVEL 3', function () {
      test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
      test.heading('HEADING LEVEL 4', function () {
        test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
        test.heading('HEADING LEVEL 5', function () {
          test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
          test.heading('HEADING LEVEL 6', function () {
            test.paragraph("Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  Now is the good time for paragraphs.  ")
            test.example('bbb', function () {
              // this sample code here
              var something = 'asdasdasd';
              var nothing;
              if (something == nothing) {
                console.log("well isn't that special, ok listen this code is long enought to show what margin is needed at most ok???");
              }
            });
          });
        });
      });
    });
  });
  test.paragraph("This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.")
  test.heading('PEACE', function () {
    test.example('PIPE');
  });
  test.paragraph("This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.")
  test.example('aaa');
  test.paragraph("This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.  This is for real.")
  test.example('bbb', function () {
    // this example is a bb
    var x1 = 1;
    var x2 = 2;
    // cool
  });


});
test.stop();
test.render();
