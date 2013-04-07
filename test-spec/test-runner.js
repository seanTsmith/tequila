/**
 * tequila
 * test-tequila
 */
var TestNode = function (nodeType, level, levelText, text, func, exampleNumber, deferedExample, expectedValue) {
  this.nodeType = nodeType; // nodeType 1 char string: H)eading P)aragraph E)xample E(X)eption
  this.level = level;
  this.levelText = levelText;
  this.text = text;
  this.func = func;
  this.exampleNumber = exampleNumber;
  var funcText;
  if (func) {
    funcText = test.formatCode(func);
  }
  this.deferedExample = (funcText && funcText.length>0) ? deferedExample : true;
  this.expectedValue = expectedValue;
  return this;
};
var test = {};
test.converter = new Markdown.Converter();
test.showWork = [];
test.start = function (options) {
  this.nodes = [];
  this.exampleNumber = 0;
  this.headingLevel = 0;
  this.levels = [0];
};
test.heading = function (text, func) {
  this.levels[this.headingLevel]++;
  this.outlineLabel = '';
  for (var i in this.levels) this.outlineLabel += this.levels[i].toString() + '.';
  this.nodes.push(new TestNode('h', this.headingLevel + 1, this.outlineLabel, text, func));
  if (func) {
    this.headingLevel++;
    this.levels[this.headingLevel] = 0;
    func();
    this.headingLevel--;
    this.levels.pop();
  }
};
test.paragraph = function (text) {
  this.nodes.push(new TestNode('P', this.headingLevel + 1, this.outlineLabel, text));
};
test.example = function (text, expect, func) {
  this.exampleNumber++;
  this.nodes.push(new TestNode('e', this.headingLevel + 1, this.outlineLabel, text, func, this.exampleNumber, false, expect));
};
test.xexample = function (text, expect, func) {
  this.exampleNumber++;
  this.nodes.push(new TestNode('e', this.headingLevel + 1, this.outlineLabel, text, func, this.exampleNumber, true, expect));
};
test.show = function (value) {
  if (value == null || value instanceof Date || typeof value == 'number' || typeof value == 'function' || value instanceof RegExp) {
    test.showWork.push(value);
    return;
  }
  if (value !== undefined) {
    test.showWork.push(JSON.stringify(value));
    return;
  }
  test.showWork.push(value);
};
test.stop = function () {
};
test.run = function (resultsCallback) {

};
test.render = function (isBrowser) {

  test.countTests = 0;
  test.countPass = 0;
  test.countFail = 0;
  test.countDefer = 0;

  // Browser Dressing
  if (isBrowser) {
    // Fixed Header Div
    var headerDiv = document.createElement("div");
    headerDiv.style.position = 'fixed';
    headerDiv.style.top = '0px';
    headerDiv.style.margin = 'auto';
    headerDiv.style.zIndex = '100000';
    headerDiv.style.width = '100%';
    headerDiv.style.background = '#AA4'; // yellow header to start
    var stats = document.createElement("p");
    stats.id = "stats";
    stats.innerHTML = test.converter.makeHtml('**tequila**');
    stats.align = 'center';
    stats.style.padding = '0px';
    stats.style.margin = '0px';
    headerDiv.appendChild(stats);
    document.body.appendChild(headerDiv);
    // Outer & Inner Div to center content
    var outerDiv = document.createElement("div");
    outerDiv.style.width = "100%";
    document.body.appendChild(outerDiv);
    var innerDiv = document.createElement("div");
    innerDiv.style.width = "1000px";
    innerDiv.style.margin = "0 auto";
    outerDiv.appendChild(innerDiv);
  } else {
    process.stdout.write('Testing 123...');
  }

  for (i in test.nodes) {
    var testNode = test.nodes[i].nodeType;
    if (!isBrowser) {
      if (testNode == 'e') {
        testNode = '.';
      } else {
        testNode = '';
      }
    }
    switch (testNode) {
      case 'h':
        var p = document.createElement("h" + test.nodes[i].level);
        var lt = test.nodes[i].levelText;
        if (lt == '1.') lt = '';
        if (lt.length > 2) lt = lt.substring(0, lt.length - 1);
        p.innerHTML = lt + ' ' + test.nodes[i].text;
        innerDiv.appendChild(p);
        break;

      case 'P':
        var p = document.createElement("p");
        p.innerHTML = test.converter.makeHtml(test.nodes[i].text);
        innerDiv.appendChild(p);
        break;

      case '.':
        test.countTests++;
        if (!test.nodes[i].deferedExample && test.nodes[i].func) {
          test.showWork = [];
          var test_Results = test.callTestCode(test.nodes[i].func);
          if (test_Results.toString() !== test.nodes[i].expectedValue.toString()) {
            test.countFail++;
            console.log('\n' + colors.red('✘') + colors.white(' RETURNED: ' + test.expressionInfo(test_Results) + ' EXPECTED: ' + test.expressionInfo(test.nodes[i].expectedValue)));
          } else {
            test.countPass++;
            process.stdout.write(colors.green('✓'));
          }
        } else {
          test.countDefer++;
          process.stdout.write(colors.yellow('✍'));
        }
        break;

      case 'e':
        var caption = document.createElement("caption");
        caption.innerHTML = '<caption>' + 'EXAMPLE #' + test.nodes[i].exampleNumber + ' ' + test.nodes[i].text + '</caption>'
        innerDiv.appendChild(caption);
        var pre = document.createElement("pre");
        pre.className = "prettyprint";
        test.countTests++;
        if (!test.nodes[i].deferedExample && test.nodes[i].func) {
          test.showWork = [];
          var test_Results = test.callTestCode(test.nodes[i].func);
          var exampleCode = '';
          exampleCode += test.formatCode(test.nodes[i].func);
          var testPassed;

          if (typeof test_Results == 'undefined') {
            if (typeof test.nodes[i].expectedValue == 'undefined') testPassed = true;
          } else {
            if (typeof test.nodes[i].expectedValue != 'undefined' && test_Results.toString() === test.nodes[i].expectedValue.toString()) testPassed = true;
          }
          if (testPassed) {
            test.countPass++;
            pre.style.background = "#cfc"; // green
            if (test.wasThrown) {
              exampleCode += '✓ <b>error thrown as expected (' + test_Results + ')</b>'; // ✘
            } else {
              exampleCode += '✓ <b>returns ' + test.expressionInfo(test_Results) + ' as expected</b>'; // ✘
            }
          } else {
            test.countFail++;
            if (!test.countFail) headerDiv.style.background = '#F33'; // fail color color
            pre.style.background = "#fcc"; // red
            if (test.wasThrown) {
              exampleCode += '✘ <b>ERROR THROWN: ' + test.expressionInfo(test_Results) + '\n  EXPECTED: ' + test.expressionInfo(test.nodes[i].expectedValue) + '</b>'; // ✘
            } else {
              exampleCode += '✘ <b>RETURNED: ' + test.expressionInfo(test_Results) + '\n  EXPECTED: ' + test.expressionInfo(test.nodes[i].expectedValue) + '</b>'; // ✘
            }
          }
          pre.innerHTML = '<code>' + exampleCode + '</code>';
        } else {
          test.countDefer++;
          pre.style.background = "#ffc"; // yellow
          if (test.nodes[i].func) {
            exampleCode = test.formatCode(test.nodes[i].func);
            exampleCode += '✍ <b>(test disabled)</b>';
            pre.innerHTML = exampleCode;
          } else {
            pre.innerHTML = '<code> TODO: write some code that rocks.</code>';
          }
        }
        innerDiv.appendChild(pre);
        test.updateStats();
        break;
    }
  }
  if (isBrowser) {
    if (!test.countFail) headerDiv.style.background = '#6C7'; // pass color
  } else {
    var results = '\n ' + test.countTests + ' pass(' + test.countPass + ') fail(' + test.countFail + ') defer(' + test.countDefer + ') ';
    if (test.countFail)
      console.log(colors.inverse(colors.red(results)));
    else
      console.log(colors.inverse(colors.green(results)));
  }
};
test.updateStats = function () {
  var stats = document.getElementById("stats");
  stats.innerHTML = test.converter.makeHtml('**tequila** tests(**' + test.countTests + '**) pass(**' + test.countPass + '**) fail(**' + test.countFail + '**) defer(**' + test.countDefer + '**)');
}
test.expressionInfo = function (expr) {

  if (typeof expr == 'string') {
    return '"' + expr.replace(/"/g, '\\\"') + '"';
  }
  return expr;
}
test.callTestCode = function (func) {
  try {
    test.wasThrown = false;
    return func();
  } catch (e) {
    test.wasThrown = true;
    return e;
  }
}
test.formatCode = function (txt) {
  var lines = [];
  var spaces = [];
  var spaceCount = 0;
  var gotNonSpace = false;
  var line = '';
  var i, j;
  var w = 0;
  var s = txt.toString();
  for (i = 0; i < s.length; i++) {
    if (s[i] == '\n') {
      if (line.substring(0, 9) == 'test.show') {
        if (w < test.showWork.length) {
          var oldline = line.substring(10);
          if (oldline.length > 0) oldline = oldline.substring(0, oldline.length - 1);
          if (oldline.length > 0) oldline = oldline.substring(0, oldline.length - 1);
          if (oldline)
            line = '<b>// ' + oldline + ' is ' + test.showWork[w] + '</b>';
          else
            line = '<b>// i got nothing</b>';
          console.log(line);
          w++;
        }
      }
      lines.push(line);
      line = '';
      spaces.push(spaceCount);
      spaceCount = 0;
      gotNonSpace = false;
    } else {
      if (s[i] == ' ' && !gotNonSpace) {
        spaceCount++;
      } else {
        gotNonSpace = true;
        line += s[i];
      }
    }
  }
  var adjustspace = spaces[1];
  var output = '';
  for (i = 1; i < lines.length; i++) { // skip 'function'
    var spaceOut = spaces[i] - adjustspace;
    for (j = 1; j < spaceOut; j++) output += ' ';
    output += ' ' + lines[i] + '\n';
  }

  return output;
};
