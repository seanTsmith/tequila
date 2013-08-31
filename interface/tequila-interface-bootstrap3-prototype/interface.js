/**
 * interface.js
 */

var interface = {};

// -------------------------------------------------------------------------------------------------------------------
// Entry point when document ready
// -------------------------------------------------------------------------------------------------------------------
$(document).ready(function () {

  // Create html elements for framework
  interface.renderFramework();

  // Remover loading panel
  try {
    var loadingPanel = document.getElementById("loadingPanel");
    loadingPanel.parentNode.removeChild(loadingPanel);
  } catch (e) {
  }

});

// -------------------------------------------------------------------------------------------------------------------
// Render Framework
// -------------------------------------------------------------------------------------------------------------------
interface.renderFramework = function () {
  interface.renderNavBar();
};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar
// -------------------------------------------------------------------------------------------------------------------
interface.renderNavBar = function () {

  // Main navbar
  interface.navBar = document.createElement("header");
  interface.navBar.id = "navBar";
  interface.navBar.className = "navbar navbar-default navbar-fixed-top";
//  interface.navBar.className = "navbar navbar-inverse navbar-fixed-top";
  interface.navBar.setAttribute('role', 'banner');
  document.body.appendChild(interface.navBar);

  // Container so bootstrap centers
  interface.navContainer = document.createElement("div");
  interface.navContainer.id = "navContainer";
  interface.navContainer.className = "container";
  interface.navBar.appendChild(interface.navContainer);

  // Responsive header
  interface.navResponsiveHeader = document.createElement("div");
  interface.navResponsiveHeader.id = "navResponsiveHeader";
  interface.navResponsiveHeader.className = "navbar-header";
  interface.navContainer.appendChild(interface.navResponsiveHeader);

  // Navbar toggle button when small presentation
  var iconBar = '<span class="icon-bar"></span>';
  interface.navBarToggle = document.createElement("button");
  interface.navBarToggle.id = "navBarToggle";
  interface.navBarToggle.className = "navbar-toggle";
  interface.navBarToggle.setAttribute('type', 'button');
  interface.navBarToggle.setAttribute('data-toggle', 'collapse');
  interface.navBarToggle.setAttribute('data-target', '.navbar-collapse');
  interface.navBarToggle.innerHTML = iconBar + iconBar + iconBar;
  interface.navResponsiveHeader.appendChild(interface.navBarToggle);

  // Brand
  interface.navBarBrand = document.createElement("a");
  interface.navBarBrand.id = "navBarBrand";
  interface.navBarBrand.className = "navbar-brand";
  interface.navBarBrand.innerHTML = '<a href="javascript:alert(\'wtf\')">' + 'tequila.js' + '</a>';
  interface.navResponsiveHeader.appendChild(interface.navBarBrand);

//  <li class="active"><a style="display: block; text-align: center;" href="javascript:loadStore()">TRY AGAIN</a></li>


  // Collapsible navbar
  interface.collapsibleNavBar = document.createElement("nav");
  interface.collapsibleNavBar.id = "collapsibleNavBar";
  interface.collapsibleNavBar.className = "navbar-collapse collapse";
  interface.collapsibleNavBar.setAttribute('role', 'navigation');
  interface.navContainer.appendChild(interface.collapsibleNavBar);

  // navbar list
  interface.navList = document.createElement("ul");
  interface.navList.id = "navList";
  interface.navList.className = "nav navbar-nav";
  interface.collapsibleNavBar.appendChild(interface.navList);

  interface.stooges = interface.renderNavBarListMenu(interface.navList, 'Stooges');
  interface.renderNavBarListItem(interface.stooges, 'Moe');
  interface.renderNavBarListItem(interface.stooges, 'Larry');
  interface.renderNavBarListItem(interface.stooges, 'Curly');

  interface.fruit = interface.renderNavBarListMenu(interface.navList, 'Fruit');
  interface.renderNavBarListItem(interface.fruit, 'Apple');
  interface.renderNavBarListItem(interface.fruit, 'Banana');
  interface.renderNavBarListItem(interface.fruit, 'Cherry');
  interface.renderNavBarListItem(interface.fruit, 'Peach');

  interface.superhero = interface.renderNavBarListMenu(interface.navList, 'Super Heroes');
  interface.renderNavBarListItem(interface.superhero, 'Superman');
  interface.renderNavBarListItem(interface.superhero, 'Batman');
  interface.renderNavBarListItem(interface.superhero, 'Spiderman');


};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Item
// -------------------------------------------------------------------------------------------------------------------
interface.renderNavBarListItem = function (parent, name) {
  var listItem = document.createElement('li');
  listItem.innerHTML = '<a href="#">' + name + '</a>';
  parent.appendChild(listItem);
};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Menu
// -------------------------------------------------------------------------------------------------------------------
interface.renderNavBarListMenu = function (parent, name) {

  var dropDown = document.createElement('li');
  dropDown.className = "dropdown";
  dropDown.innerHTML = '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' + name + '<b class="caret"></b></a>'
  parent.appendChild(dropDown);

  var dropDownMenu = document.createElement('ul');
  dropDownMenu.className = "dropdown-menu";
  dropDown.appendChild(dropDownMenu);


  return dropDownMenu;
};








































