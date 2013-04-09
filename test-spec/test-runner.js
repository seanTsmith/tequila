/**
 * tequila
 * test-tequila
 */
var TestNode = function (inheritanceTest, nodeType, level, levelText, text, func, exampleNumber, deferedExample, expectedValue) {
  this.inheritanceTest = inheritanceTest;
  this.nodeType = nodeType; // nodeType 1 char string: H)eading P)aragraph E)xample E(X)eption
  this.level = level;
  this.levelText = levelText;
  this.text = text;
  this.func = func;
  this.exampleNumber = exampleNumber;
  var funcText;
  if (func) {
    funcText = test.formatCode(func, false);
  }
  this.deferedExample = (funcText && funcText.length > 0) ? deferedExample : true;
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
  this.nodes.push(new TestNode(T.inheritanceTest, 'h', this.headingLevel + 1, this.outlineLabel, text, func));
  if (func) {
    this.headingLevel++;
    this.levels[this.headingLevel] = 0;
    func();
    this.headingLevel--;
    this.levels.pop();
  }
};
test.paragraph = function (text) {
  this.nodes.push(new TestNode(T.inheritanceTest, 'p', this.headingLevel + 1, this.outlineLabel, text));
};
test.example = function (text, expect, func) {
  this.exampleNumber++;
  this.nodes.push(new TestNode(T.inheritanceTest, 'e', this.headingLevel + 1, this.outlineLabel, text, func, this.exampleNumber, false, expect));
};
test.xexample = function (text, expect, func) {
  this.exampleNumber++;
  this.nodes.push(new TestNode(T.inheritanceTest, 'e', this.headingLevel + 1, this.outlineLabel, text, func, this.exampleNumber, true, expect));
};
test.assertion = function (truDat) {
  test.assertions.push(truDat);
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

test.getParam = function (name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null)
    return "";
  else
    return results[1];
};

test.refresh = function () {
  var vars = '';
  if (test.hideExamples) vars += (vars ? '&' : '') + '?he=Y';
  if (test.filterSection) vars += (vars ? '&' : '') + '?fs=' + test.filterSection;
  window.location.href = "file:///Users/sean/Sites/tequila/test-spec/test-runner.html#" + vars;
  window.location.reload();
};

test.render = function (isBrowser) {
  test.countTests = 0;
  test.countPass = 0;
  test.countFail = 0;
  test.countDefer = 0;
  // Browser Dressing
  if (isBrowser) {

    // Get vars from URL
    test.hideExamples = (test.getParam('he') == 'Y');
    test.filterSection = test.getParam('fs');
    test.filterTest = test.getParam('ft');

    // Fixed Header Div
    var headerDiv = document.createElement("div");
    headerDiv.style.position = 'fixed';
    headerDiv.style.top = '0px';
    headerDiv.style.margin = 'auto';
    headerDiv.style.zIndex = '100000';
    headerDiv.style.width = '100%';
    headerDiv.style.background = '#AA4'; // yellow header to start
    document.body.appendChild(headerDiv);

    // div for stats
    var stats = document.createElement("p");
    stats.id = "stats";
    stats.class = "stats";
    stats.innerHTML = test.converter.makeHtml('**tequila**');
    stats.style.float = 'left';
    stats.style.fontSize = 'large'
    stats.align = 'left';
    stats.style.padding = '0px';
    stats.style.margin = '0px 8px';
    headerDiv.appendChild(stats);

    // div for controls
    var controls = document.createElement("div");
    controls.id = "controls";
    controls.style.float = 'right';
    controls.style.padding = '0px';
    controls.style.margin = '0px 16px';
    headerDiv.appendChild(controls);

    // button for toggle example display
    var btnExampleToggle = document.createElement("button");
    btnExampleToggle.id = "btnExampleToggle";
    btnExampleToggle.name = "btnExampleToggle";
    if (test.hideExamples) {
      btnExampleToggle.innerHTML = '<b>examples</b><br><em>(hidden)</em>';
    } else {
      btnExampleToggle.innerHTML = '<b>examples</b><br><em>(shown)</em>';
    }
    btnExampleToggle.onclick = function () {
      test.hideExamples = !test.hideExamples;
      test.refresh();
    };
    controls.appendChild(btnExampleToggle);

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

  var scrollFirstError = 0;

  for (i in test.nodes) {

    // Check filter
    var isFiltered = false;
    var x1 = (test.filterSection+'.');
    if (x1.indexOf('..')>=0) x1 = (test.filterSection);
    if (test.filterSection && (test.nodes[i].levelText).indexOf(x1)!=0) {
      isFiltered = true;
      var x2 = (test.nodes[i].levelText);
      console.log(x1 + ' : ' + x2);
      if (x1.indexOf((test.nodes[i].levelText))==0) {
        isFiltered = false;
      }
    }
    if (test.nodes[i].inheritanceTest) isFiltered = true;

    var testNodeType = test.nodes[i].nodeType;
    if (!isBrowser) {
      if (testNodeType == 'e') {
        testNodeType = '.';
      } else {
        testNodeType = '';
      }
    }
    switch (testNodeType) {
      case 'h':
        if (!isFiltered) {
          var p = document.createElement("h" + test.nodes[i].level);
          var lt = test.nodes[i].levelText;
          if (lt.length > 2) lt = lt.substring(0, lt.length - 1);
          p.innerHTML = lt + ' ' + test.nodes[i].text;
          p.onclick = function () {
            var words = this.innerText.split(' ');
            test.filterSection = '';
            if (words.length>0 && parseInt(words[0])>0)
              test.filterSection = words[0];
            test.refresh();
          };
          innerDiv.appendChild(p);
        }
        break;

      case 'p':
        if (!isFiltered) {
          var p = document.createElement("p");
          p.innerHTML = test.converter.makeHtml(test.nodes[i].text);
          innerDiv.appendChild(p);
        }
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
        var testPassed = false;
        var ranTest = false;
        var caption = document.createElement("caption");
        caption.innerHTML = '<caption>' + 'EXAMPLE #' + test.nodes[i].exampleNumber + ' ' + test.nodes[i].text + '</caption>';
        var pre = document.createElement("pre");
        pre.className = "prettyprint";
        test.countTests++;
        if (!test.nodes[i].deferedExample && test.nodes[i].func) {
          test.showWork = [];
          test.assertions = [];
          var test_Results = test.callTestCode(test.nodes[i].func);
          ranTest = true;
          var exampleCode = '';
          exampleCode += test.formatCode(test.nodes[i].func, true);
          if (typeof test_Results == 'undefined') {
            if (typeof test.nodes[i].expectedValue == 'undefined') testPassed = true;
          } else {
            if (typeof test.nodes[i].expectedValue != 'undefined' && test_Results.toString() === test.nodes[i].expectedValue.toString()) testPassed = true;
          }
          // Check assertions
          // test.assertions
          var gotFailedAssertions = false;
          for (var j in test.assertions) {
            if (!test.assertions[j]) gotFailedAssertions = true;
          }
          if (testPassed && !gotFailedAssertions) {
            test.countPass++;
            pre.style.background = "#cfc"; // green
            if (test.wasThrown) {
              exampleCode += '✓<b>error thrown as expected (' + test_Results + ')</b>'; // ✘
            } else {
              if (typeof test_Results == 'undefined') {
                exampleCode += '✓<b>returns without harming any puppies</b>'; // ✘
              } else {
                exampleCode += '✓<b>returns ' + test.expressionInfo(test_Results) + ' as expected</b>'; // ✘
              }
            }
          } else {
            test.countFail++;
            if (test.countFail) headerDiv.style.background = '#F33'; // fail color color
            pre.style.background = "#fcc"; // red
            if (test.wasThrown) {
              if (test.nodes[i].expectedValue === undefined) {
                exampleCode += '<b>✘ERROR THROWN: ' + test.expressionInfo(test_Results) + '\n';
              } else {
                exampleCode += '<b>✘ERROR THROWN: ' + test.expressionInfo(test_Results) + '\n  EXPECTED: ' + test.expressionInfo(test.nodes[i].expectedValue) + '</b>';
              }
            } else if (testPassed && gotFailedAssertions) {
              exampleCode += '✘<b>ASSERTION(S) FAILED</b>'; // ✘
            } else {
              exampleCode += '✘<b>RETURNED: ' + test.expressionInfo(test_Results) + '\n  EXPECTED: ' + test.expressionInfo(test.nodes[i].expectedValue) + '</b>'; // ✘
            }
          }
          pre.innerHTML = '<code>' + exampleCode + '</code>';
        } else {
          test.countDefer++;
          pre.style.background = "#ffc"; // yellow
          if (test.nodes[i].func) {
            exampleCode = test.formatCode(test.nodes[i].func, false);
            exampleCode += '✍ <b>(test disabled)</b>';
            pre.innerHTML = exampleCode;
          } else {
            pre.innerHTML = '<code> TODO: write some code that rocks.</code>';
          }
        }
        var showExample = !test.hideExamples;
        if (isFiltered) showExample = false;
        if (ranTest && !testPassed) showExample = true;
        if (showExample) innerDiv.appendChild(caption);
        if (showExample) innerDiv.appendChild(pre);
        test.updateStats();
        if (ranTest && !testPassed && scrollFirstError < 1) {
          scrollFirstError = document.height - document.documentElement.clientHeight;
        }
        break;
    }
  }
  if (isBrowser) {
    if (scrollFirstError > 0)
      window.scroll(0, scrollFirstError);
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
  stats.innerHTML = test.converter.makeHtml('***tequila*** ' + T.getVersion() + ' ' +  (test.countFail?'☹':'☺') + ' tests(**' + test.countTests + '**) pass ( **' + test.countPass + '** ) fail ( **' + test.countFail + '** ) defer ( **' + test.countDefer + '** )');
}
test.expressionInfo = function (expr) {

  if (typeof expr == 'string') {
    return '"' + expr.replace(/"/g, '\\\"') + '"';
  }
  return expr;
}
test.shouldThrow = function (err, func) {
  try {
    func();
  } catch (e) {
    if (err.toString() != e.toString()) throw('EXPECTED ERROR(' + err + ') GOT ERROR(' + e + ')');
  }
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
test.formatCode = function (txt, rancode) {
  var lines = [];
  var spaces = [];
  var marks = [];
  var spaceCount = 0;
  var gotNonSpace = false;
  var line = '';
  var i, j;
  var w = 0;
  var s = txt.toString();
  var assertionsSeen = 0;
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
//          console.log(line);
          w++;
        }
      }
      if (rancode && line.substring(0, 14) == 'test.assertion') {
        marks.push((test.assertions[assertionsSeen++]) ? '✓' : '✘');
        var oldline = line.substring(15);
        if (oldline.length > 0) oldline = oldline.substring(0, oldline.length - 1);
        if (oldline.length > 0) oldline = oldline.substring(0, oldline.length - 1);
        line = '<b>ASSERT: </b>' + oldline;
      } else {
        marks.push(' ');
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
    output += marks[i] + lines[i] + '\n';
  }

  return output;
};
