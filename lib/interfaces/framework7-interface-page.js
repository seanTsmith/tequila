/**
 * tequila
 * framework7-interface-page
 */


//// -------------------------------------------------------------------------------------------------------------------
//// Render Pages
//// -------------------------------------------------------------------------------------------------------------------
//Framework7Interface.prototype.IndexPage = function (args) {
//  Model.call(this, args);
//  this.modelType = "_tempTest_Stooge";
//  this.attributes.push(new Attribute('name'));
//};
//self.Stooge.prototype = T.inheritPrototype(Model.prototype);

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

  /*
   * TODO
   * ----
   * - create model for page
   * - inherent model for non stub pages
   * - methods for model:
   * -   render (smart lazy)
   * - getText (color icon link ?)
   *
   *
   * */

//  /*** model for Index Tab Page ***/
//  self.IndexTabPage = function (args) {
//    Model.call(this, args);
//    this.modelType = "IndexTabPage";
//    this.attributes.push(new Attribute('name'));
//  };
//  self.IndexTabPage.prototype = T.inheritPrototype(Model.prototype);


//  var icons = [
//    'fa-globe',
//    'fa-chain',
//    'fa-group',
//    'fa-wrench',
//    'fa-tasks'
//  ];
//  for (var i in icons)
//    this.addIndexTabPage(icons[i], icons[i], '<H4>' + icons[i] + '</H4>');

  for (var p in this.pageHandlers)
    this.addIndexTabPage(this.pageHandlers[p].text, this.pageHandlers[p].icon, this.pageHandlers[p].callback)


};


// -------------------------------------------------------------------------------------------------------------------
// Add a page to index tabs
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addIndexTabPage = function (shortcutText, shortcutIcon, callback) {
  var tab = document.createElement("div");
  tab.id = "tab" + this.indexTabNumber;
  if (this.firstToolBarPageActive) {
    tab.className = "tab";
  } else {
    this.firstToolBarPageActive = true;
    tab.className = "tab active";
  }
  this.tabs.appendChild(tab);
  this.indexTabPages.push({div: tab, shortcutText: shortcutText, shortcutIcon: shortcutIcon});
  this.indexTabNumber++;
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
    tab.innerHTML = '<div class="content-block-title">' + page.text + '</div>' +
      '<div class="content-block">' +
      '<p>There is no code handler for this page!</p>' +
      '<p>' + JSON.stringify(bowser, null, '\t') + '</p>' +
      '</div>';
  };

  this.pageHandlers.push(page);
};