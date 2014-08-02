/**
 * tequila
 * framework7-interface-page
 */

// -------------------------------------------------------------------------------------------------------------------
// Render Pages
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.renderPages = function () {

  var self = this; // self is interface

  // F7 Pages container, because we use fixed-through navbar and toolbar, it has additional appropriate classes
  this.pages = document.createElement("div");
  this.pages.id = "pages";
  this.pages.className = "pages navbar-through toolbar-through";
  this.viewMain.appendChild(this.pages);

  // F7 data-page
  this.dataPage = document.createElement("div");
  this.dataPage.id = "dataPage";
  this.dataPage.className = "page";
  this.dataPage.setAttribute('data-page', 'index');
  this.pages.appendChild(this.dataPage);

  // F7 page-content
  this.pageContent = document.createElement("div");
  this.pageContent.id = "pageContent";
  this.pageContent.className = "page-content";
  this.dataPage.appendChild(this.pageContent);

  // F7 tabs div
  this.tabs = document.createElement("div");
  this.tabs.id = "tabs";
  this.tabs.className = "tabs";
  this.pageContent.appendChild(this.tabs);

  this.indexTabPages = [];
  this.indexTabNumber = 1;
  this.addStarterPage();
  this.addIndexTabPage(this.pageHandlers[0].text, this.pageHandlers[0].icon);
  for (var p = 1; p < this.pageHandlers.length; p++)
    this.addIndexTabPage(this.pageHandlers[p].text, this.pageHandlers[p].icon, this.pageHandlers[p].callback);

};

// -------------------------------------------------------------------------------------------------------------------
// Add starter page
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addStarterPage = function () {
  var tab = document.createElement("div");
  tab.id = "tabStarter";
  tab.className = "tab active";
  this.tabs.appendChild(tab);
  tab.innerHTML = '<div class="content-block-title">WELCOME</div>' +
    '<div class="content-block">' +
    '<p>Touch the icons below to explore.</p>' +
    '</div>';
};

// -------------------------------------------------------------------------------------------------------------------
// Add a page to index tabs
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addIndexTabPage = function (shortcutText, shortcutIcon, callback) {
  var tab = document.createElement("div");
  tab.id = "tab" + this.indexTabNumber;
  tab.className = "tab";
  this.tabs.appendChild(tab);
  this.indexTabPages.push({div: tab, shortcutText: shortcutText, shortcutIcon: shortcutIcon});
  this.indexTabNumber++;
  if (callback)
    callback(this, tab);
};

// -------------------------------------------------------------------------------------------------------------------
// Add Page Handler
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addPageHandler = function (text, icon, callback) {
  var page = {};
  page.text = text ? text : 'page';
  page.icon = icon ? icon : 'fa-question-circle';
  page.callback = callback ? callback : function (self, tab, action) {
    // if no callback
    tab.innerHTML = '<div class="content-block-title">' + page.text + '</div>' +
      '<div class="content-block">' +
      '<p>There is no code handler for this page!</p>' +
      '</div>';
  };
  this.pageHandlers.push(page);
};

// -------------------------------------------------------------------------------------------------------------------
// Select Page
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.selectPage = function (text) {
  var p;
  for (p = 0; p < this.pageHandlers.length; p++) {
    if (this.pageHandlers[p].text == text) {
      this.f7.showTab('#' + this.indexTabPages[p].div.id);
    }
  }
};

// -------------------------------------------------------------------------------------------------------------------
// Register More Page
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.registerMorePage = function (self, tab, action) {
  var topPart = '<div class="content-block"><div class="list-block"><ul>';
  var midPart = '';
  var botPart = '</ul></div></div>';
  var i;
  for (i = 0; i < self.indexTabPages.length; i++) {
    if (!self.indexTabPages[i].iconShowing) {
      midPart += '<li><a id="' + self.indexTabPages[i].div.id + 'Link" class="item-link tequila-more-link"><div class="item-content"><div class="item-media"><i class="fa ' +
        self.indexTabPages[i].shortcutIcon +
        ' fa-lg"></i></div><div class="item-inner"><div class="item-title">' +
        self.indexTabPages[i].shortcutText +
        '</div></div></div></a></li>';
    }
  }
  $(document).on('click', '.tequila-more-link', function () {
    var link = this.id;
    if (link.slice(-4) == 'Link') {
      link = link.substring(0, link.length - 4)
      console.log('tequila-more-link ' + link);
      self.f7.showTab('#' + link);
    }
  });
//  tab.innerHTML = '<div class="content-block-title">' + 'MORE' + '</div>' + topPart + midPart + botPart;
  tab.innerHTML = topPart + midPart + botPart;
};

// -------------------------------------------------------------------------------------------------------------------
// Register Device Page
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.registerDevicePage = function (self, tab, action) {
  tab.innerHTML = '<div class="content-block-title">DEVICE INFORMATION</div>' +
    '<div class="content-block">' +
    '<p>Here is what bowser detects:</p>' +
    '<p>' + JSON.stringify(bowser, null, '\t') + '</p>' +
    '<p>Here is what f7 detects:</p>' +
    '<p>' + JSON.stringify(self.f7.support, null, '\t') + '</p>' +
    '</div>';
};

// -------------------------------------------------------------------------------------------------------------------
// Register App Page
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.registerAppPage = function (self, tab, action) {
  var topPart = '<div class="content-block content-block-menu">';
  var midPart = '';
  var botPart = '</div>';
  var menuContents = self.presentation.get('contents');
  var curCol = 1;
  var maxCol = 3;
  if (menuContents.length < 7)
    topPart += '<br>';
  for (var menuItem = 0; menuItem < menuContents.length; menuItem++) {

    if (curCol == 1)
      midPart += '<div class="row">';

    midPart += self.makeAppIcon(menuContents[menuItem], menuItem);

    if (curCol++ == maxCol || menuItem == menuContents.length - 1) {
      if (curCol - 1 <= 2) {
        midPart += '<div class="col-33"></div>';
      }
      if (curCol - 1 <= 1) {
        midPart += '<div class="col-33"></div>';
      }
      curCol = 1;
      midPart += '</div>';
    }
  }
  tab.innerHTML = topPart + midPart + botPart;

  /***
   * Click Handler for app icons
   ***/
  $(document).on('click', '.tq-app-button', function (event) {
    var id = this.id;
    id = id.substring(2,99);
    var command = menuContents[id];
    console.log(command.name);
    self.dispatch(new Request({type: 'Command', command: command}));
    event.preventDefault();
  });
};

// -------------------------------------------------------------------------------------------------------------------
// Make App Icon
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.makeAppIcon = function (action, menuItem) {

  var icon = action.icon;
  var className = action.theme || 'default';

  if (!icon) {
    switch (action.type) {
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

  return '<div class="col-33">' +
    '<a href="#" id="tq' + menuItem + '" class="button button-round tq-app-button button-' + className + '">' +
    '<i class="fa button-' + className + ' ' +
    icon +
    ' tq-app-icon "></i><br>' +
    action.name +
    '</a></div>'
};

