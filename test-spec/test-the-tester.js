// Make some spam
var spam = '';
for (var i = 0; i < 90; i++) spam+='spam ';
var spam = 'Have some '+spam+'damn it!';

test.start();
test.heading('TEST THE TESTER', function () {
//  test.heading('INTRODUCTION');
//  test.paragraph('Asteriks are magical use one for *italics*, 2 for **bold italics** use 3 for ***both of them***');
//  test.paragraph('Lists just use asterik as first item:')
//  test.paragraph('* eat');
//  test.paragraph('* more');
//  test.paragraph('* chicken');
//  test.heading('PURPOSE', function () {
//    test.paragraph('This is nested inside PURPOSE.');
//    test.heading('SHOW SPAM');
//    test.paragraph(spam);
//    test.heading('SHOW MORE SPAM');
//    test.paragraph('This is nested inside PURPOSE also also.');
//    test.paragraph(spam);
//  });
//  test.paragraph('This not inside PURPOSE but looks wierd without a heading ***SO DO NOT DO IT MAN***');
//  test.heading('A HEADING');
//  test.paragraph('This text is after a heading much better');
  test.heading('TESTS', function () {
    test.paragraph("Now let's test something...");
    test.example('one equals ONE', function () {
      // this sample code here
      var something = 1;
      if (something === 1) {
        return true;
      }
      return false;
    });

  });
});
test.stop();
test.render();
