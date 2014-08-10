/**
 * tequila
 * framework7-interface-presentation
 */

// ===================================================================================================================
// Add Presentation Page
// ===================================================================================================================
Framework7Interface.prototype.addPresentationPage = function (command) {

  var i;

  // Get the presentation contents
  var contents = command.contents.get('contents');

  var topPart =
    // Navbar
    '<div class="navbar">' +
    '<div class="navbar-inner">' +
    '<div class="left"><a href="#" class="back link"><i class="icon icon-back-blue"></i><span>Back</span></a></div>' +
    '<div class="center sliding">' + command.name + '</div>' +
    '</div></div>' +
    // Pages
    '<div class="pages">' +
    '<div data-page="dynamic-pages" class="page">' +
    '<div class="page-content">' +
    '<div class="content-block-presentation">';

  var midPart = ''; // filled in with attribs
  var botPart = '</div></div></div></div>';

  var inListBlock = false;    // inside list-block div
  var inContentBlock = false; // inside content-block div
  var buttonColumn = 0;       // 0 means none rendered and need row div

  // Go past array on purpose to process closing tags
  for (i = 0; i <= contents.length; i++) {

    var isString = false;
    var isAttribute = false;
    var isCommand = false;

    // are we on a legit element?
    if (i < contents.length) {
      isString = (typeof contents[i] == 'string');
      isAttribute = (contents[i] instanceof Attribute);
      isCommand = (contents[i] instanceof Command);
    }

    // Check any closing tags needed
    if (inListBlock && !isAttribute) {
      inListBlock = false;
      midPart += '</div></ul>';
    }
    if (inContentBlock && !isCommand) {
      inContentBlock = false;
      if (buttonColumn > 0) {
        midPart += '</div></div>'; // content-block and row
      } else {
        midPart += '</div>'; // content-block
      }
    }

    // String markdown or separator '-'
    if (isString) {
      if (contents[i] == '-') {
        midPart += '<hr>';
      } else {
        midPart += markdown.toHTML(contents[i]);
      }
    }
    if (isAttribute)
      renderAttribute(contents[i]);
    if (isCommand)
      renderCommand(contents[i]);
  }

  this.f7mainView.hideToolbar();
  this.f7mainView.loadContent(topPart + midPart + botPart);


// -------------------------------------------------------------------------------------------------------------------
  function renderAttribute(attribute) { // function to render Attribute
// -------------------------------------------------------------------------------------------------------------------

    var valueHTML = attribute.value ? 'value="' + attribute.value + '" ' : ' ';
    var placeholderHTML = attribute.placeHolder ? 'placeholder="' + attribute.placeHolder + '" ' : ' ';
    var maxlengthHTML = attribute.size ? 'maxlength="' + attribute.size + '" ' : ' ';
    var items = '';
    var i;

    if (!inListBlock) {
      inListBlock = true;
      midPart += '<div class="list-block"><ul>';
    }

    midPart += '<li><div class="item-content"><div class="item-inner">';

    // Render based on type and other factors
    midPart += '<div class="item-title label">' + attribute.label + '</div>';
    if (attribute.type == 'Boolean') {
      midPart += '<div class="item-input"><label class="label-switch"><input type="checkbox" ' + (attribute.value ? 'checked' : '') + '/><div class="checkbox"></div></label></div>';
    } else if (attribute.type == 'Date') {
      midPart += '<div class="item-input"><input type="date" ' + '/></div>';
    } else if (attribute.quickPick) {
      for (i = 0; i < attribute.quickPick.length; i++) items += '<option>' + attribute.quickPick[i] + '</option>';
      midPart += '<div class="item-input">' +
        '<select>' + items + '</select>' +
        '</div>';
    } else {
      var typeHTML = 'input type="text"';
      if (attribute.hint.password) typeHTML = 'input type="password"';
      if (attribute.type == 'Number') typeHTML = 'input type="number"';
      midPart += '<div class="item-input"><' + typeHTML + placeholderHTML + valueHTML + maxlengthHTML + '/></div>';
    }
    midPart += '</div></div></li>';
  }

// -------------------------------------------------------------------------------------------------------------------
  function renderCommand(command) { // function to render Command
// -------------------------------------------------------------------------------------------------------------------
    var icon = command.icon;
    var className = command.theme || 'default';
    if (className == 'default')
      className = 'default-presentation';

    if (!icon) {
      switch (command.type) {
        case "Menu":
          icon = 'fa-th-large';
          break;
        case "Presentation":
          icon = 'fa-building';
          break;
        case "Function":
          icon = 'fa-gear';
          break;
        case "Procedure":
          icon = 'fa-gears';
          break;
        default:
          icon = 'fa-square-o';
          break;
      }
    }
    if (!inContentBlock) {
      inContentBlock = true;
      buttonColumn = 0;
      midPart += '<div class="content-block">';
    }
    if (!buttonColumn) {
      midPart += '<div class="row button-row">';
      buttonColumn = 0;
    }
    midPart += '<div class="col-50"><a href="#" class="button button-' + className + '"><i class="fa ' + icon + '">&nbsp</i>Button</a></div>';

    if (++buttonColumn >= 2) {
      midPart += '</div>';
      buttonColumn = 0;
    }
  }

};
