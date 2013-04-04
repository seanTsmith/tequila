/**
 * tequila
 * test-tequila
 */


var TestNode = function (nodeType, level, levelText, text, func, exampleNumber, expectException, expectedValue) {
  this.nodeType = nodeType; // nodeType 1 char string: H)eading P)aragraph E)xample E(X)eption
  this.level = level;
  this.levelText = levelText;
  this.text = text;
  this.func = func;
  this.exampleNumber = exampleNumber;
  this.expectException = expectException;
  this.expectedValue = expectedValue;
  return this;
};


var test = {};
test.converter = new Markdown.Converter();
test.log = function (txt) {
//  console.log(txt);
};
test.start = function (options) {
  this.nodes = [];
  this.exampleNumber = 0;
  this.headingLevel = 0;
  this.levels = [0];
  this.log('test.start')
};
test.heading = function (text, func) {
  this.levels[this.headingLevel]++;
  this.outlineLabel = '';
  for (var i in this.levels) this.outlineLabel += this.levels[i].toString() + '.';
  this.nodes.push(new TestNode('h', this.headingLevel + 1, this.outlineLabel, text, func));
  this.log('test.heading: ' + this.outlineLabel + ' ' + text)
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
  this.log('test.paragraph ' + text)
};
test.example = function (text, func, expect) {
  this.exampleNumber++;
  this.log('test.example ' + this.outlineLabel + ' ' + text)
  if (func) func();
  this.nodes.push(new TestNode('e', this.headingLevel + 1, this.outlineLabel, text, func, this.exampleNumber));
};
test.exception = function (text, func, Error) {
  this.exampleNumber++;
  this.log('test.exception ' + this.outlineLabel + ' ' + text)
  if (func) func();
};
test.stop = function () {
  this.log('test.stop')
};
test.run = function (resultsCallback) {
  this.log('test.run')
};
test.render = function (options) {
  this.log('test.render')
  var outerDiv = document.createElement("div");
  outerDiv.style.width = "100%";
  document.body.appendChild(outerDiv);
  var innerDiv = document.createElement("div");
  innerDiv.style.width = "1000px";
  innerDiv.style.margin = "0 auto";
  outerDiv.appendChild(innerDiv);

  for (i in test.nodes) {
    switch (test.nodes[i].nodeType) {
      case 'h':
        var p = document.createElement("h" + test.nodes[i].level);
        var lt =  test.nodes[i].levelText;
        if (lt=='1.') lt = '';
        if (lt.length>2) lt = lt.substring(0,lt.length-1);
        p.innerHTML = lt + ' ' + test.nodes[i].text;
        innerDiv.appendChild(p);
        break;
      case 'P':
        var p = document.createElement("p");
        p.innerHTML = test.converter.makeHtml(test.nodes[i].text);
        innerDiv.appendChild(p);

//   var text = "Markdown *rocks*.";
//
//
//   var html = converter.makeHtml(text);
//
//   alert(html);

        break;
      case 'e':
        var caption = document.createElement("caption");
        caption.innerHTML = '<caption>' + 'EXAMPLE #' + test.nodes[i].exampleNumber + ' ' + test.nodes[i].text + '</caption>'
        innerDiv.appendChild(caption);
        var pre = document.createElement("pre");
        pre.className = "prettyprint";
        if (test.nodes[i].func) {
          pre.innerHTML = '<code>' + test.formatCode(test.nodes[i].func) + '</code>';
        } else {
          pre.innerHTML = '<code> TODO: write some code that rocks.</code>';
        }
        innerDiv.appendChild(pre);
        break;
    }
  }
};

test.formatCode = function (txt) {
  var lines = [];
  var spaces = [];
  var spaceCount = 0;
  var gotNonSpace = false;
  var line = '';
  var i, j;
  var s = txt.toString();
  for (i = 0; i < s.length; i++) {
    if (s[i] == '\n') {
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