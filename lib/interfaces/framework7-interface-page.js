/**
 * tequila
 * framework7-interface-page
 */

// -------------------------------------------------------------------------------------------------------------------
// Render Pages
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.renderPages = function () {

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

  this.indexTabs = [];
  this.indexTabNumber = 1;

  // TODO: Next add based on registered pages

  var icons = [
    'fa-globe',
    'fa-chain',
    'fa-chain',
    'fa-group',
    'fa-group',
    'fa-group',
    'fa-wrench',
    'fa-wrench',
    'fa-wrench',
    'fa-wrench',
    'fa-tasks',
    'fa-tasks',
    'fa-tasks',
    'fa-tasks',
    'fa-tasks'
  ];

  for (var i in icons)
    this.addIndexTab(icons[i],icons[i],'<H4>' + icons[i] + '</H4>');


};


// -------------------------------------------------------------------------------------------------------------------
// Add a ToolBar Tab (Icon)
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addIndexTab = function (text, icon, innerHTML) {
  var tab = document.createElement("div");
  tab.id = "tab" + this.indexTabNumber;
  tab.className = "tab";
  tab.innerHTML = innerHTML;
  this.tabs.appendChild(tab);
  this.indexTabs.push({div: tab, text: text, icon: icon});
  this.indexTabNumber++;
};