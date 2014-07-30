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

  // Here are the tabs to display
  // Will create one for each IndexTabPage that has been created
  this.toolBarTabs = [];

  // determine max icons that can fit
  var iconMaxFit = 7;
  var needMore = (this.indexTabPages.length > iconMaxFit);
  var iconsShowing = needMore ? iconMaxFit : this.indexTabPages.length;

  for (var i=0;  i< iconsShowing; i++)
    this.addToolBarLink(this.indexTabPages[i].shortcutText, this.indexTabPages[i].shortcutIcon, this.indexTabPages[i].div.id);

};

// -------------------------------------------------------------------------------------------------------------------
// Add a link to toolbar
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addToolBarLink = function (text, icon, id) {

  var tab = document.createElement("a");
  tab.href = "#" + id;
  tab.className = "tab-link";

  if (this.firstToolBarLinkActive) {
    tab.className = "tab-link";
  } else {
    this.firstToolBarLinkActive = true;
    tab.className = "tab-link active";
  }

  tab.innerHTML = '<i class="fa ' + icon + ' fa-lg"></i><span class="tabbar-label tabbar-label-fix">' + text + '</span>';
  this.toolBarInner.appendChild(tab);
  this.toolBarTabs.push(tab);
};