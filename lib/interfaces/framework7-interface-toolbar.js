/**
 * tequila
 * framework7-interface-toolbar
 */

// -------------------------------------------------------------------------------------------------------------------
// Render Toolbar (On Botton)
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.renderToolBar = function () {

  // F7 toolbar
  this.toolBar = document.createElement("div");
  this.toolBar.id = "pages";
  this.toolBar.className = "toolbar tabbar tabbar-labels";
  this.viewMain.appendChild(this.toolBar);

  // F7 toolbar-inner
  this.toolBarInner = document.createElement("div");
  this.toolBarInner.id = "toolBarInner";
  this.toolBarInner.className = "toolbar-inner";
  this.toolBar.appendChild(this.toolBarInner);

  // TODO: icons for each page created

  var icons = [
    'fa-globe',
    'fa-chain',
    'fa-group',
    'fa-wrench',
    'fa-tasks'
  ]


  // Here are the tabs to display
  this.toolBarTabs = [];

  for (var i in icons)
    this.addToolBarTabs(icons[i], icons[i]);

};

// -------------------------------------------------------------------------------------------------------------------
// Add a ToolBar Tab (Icon)
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addToolBarTabs = function (text, icon) {

  var tab = document.createElement("a");
  tab.href = "#";
  tab.className = "tab-link";
  tab.innerHTML = '<i class="fa ' + icon + ' fa-lg"></i><span class="tabbar-label tabbar-label-fix">' + text + '</span>';
  this.toolBarInner.appendChild(tab);

  this.toolBarTabs.push(tab);

};