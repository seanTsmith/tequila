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
//  if (this.firstToolBarPageActive) {
  tab.className = "tab";
//  } else {
//    this.firstToolBarPageActive = true;
//    tab.className = "tab active";
//  }
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
      '<p>' + JSON.stringify(bowser, null, '\t') + '</p>' +
      '</div>';
  };
  this.pageHandlers.push(page);
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
      link = link.substring(0,link.length-4)
      console.log('tequila-more-link ' + link);
      self.f7.showTab('#'+link);
    }
  });
  tab.innerHTML = '<div class="content-block-title">' + 'MORE' + '</div>' + topPart + midPart + botPart;
};

// -------------------------------------------------------------------------------------------------------------------
// Register Device Page
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.registerDevicePage = function (self, tab, action) {
  var topPart = '<div class="content-block"><div class="list-block"><ul>';
  var midPart = '';
  var botPart = '</ul></div></div>';
  tab.innerHTML = '<div class="content-block-title">DEVICE INFORMATION</div>' +
    '<div class="content-block">' +
    '<p>Here is what bowser detects:</p>' +
    '<p>' + JSON.stringify(bowser, null, '\t') + '</p>' +
    '<p>Here is what f7 detects:</p>' +
    '<p>' + JSON.stringify(self.f7.support, null, '\t') + '</p>' +
    '</div>';
};
