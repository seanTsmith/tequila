/**
 * tequila
 * framework7-interface-toolbar
 */

// -------------------------------------------------------------------------------------------------------------------
// Render Toolbar (On Bottom)
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.renderToolBar = function () {

  // F7 toolbar
  this.toolBar = document.createElement("div");
  this.toolBar.id = "toolBar";
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
  ];

  // Here are the tabs to display
  this.toolBarTabs = [];

  // determine max icons that can fit
  var iconMaxFit = 7;
  var needMore = (this.indexTabs.length > iconMaxFit);
  var iconsShowing = needMore ? iconMaxFit : this.indexTabs.length;


  for (var i=0;  i< iconsShowing; i++)
    this.addToolBarTabs(this.indexTabs[i].text, this.indexTabs[i].icon, this.indexTabs[i].div.id);

};

// -------------------------------------------------------------------------------------------------------------------
// Add a ToolBar Tab (Icon)
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addToolBarTabs = function (text, icon, id) {

  var tab = document.createElement("a");
  tab.href = "#" + id;
  tab.className = "tab-link";
  tab.innerHTML = '<i class="fa ' + icon + ' fa-lg"></i><span class="tabbar-label tabbar-label-fix">' + text + '</span>';
  this.toolBarInner.appendChild(tab);
  this.toolBarTabs.push(tab);
};