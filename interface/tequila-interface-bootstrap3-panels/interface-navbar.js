/**
 * tequila
 * interface-navbar
 */

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderNavBar = function () {

  // Main navbar
  myInterface.navBar = document.createElement("header");
  myInterface.navBar.id = "navBar";
  myInterface.navBar.className = "navbar navbar-inverse navbar-fixed-top";
  myInterface.navBar.setAttribute('draggable', 'true'); // so you can't select text
  myInterface.navBar.setAttribute('role', 'banner');
  document.body.appendChild(myInterface.navBar);

  // Fake div to offset fixed navbar in body
  myInterface.navBarShunt = document.createElement("div");
  myInterface.navBarShunt.id = "navBarShunt";
  myInterface.navBarShunt.className = "navbar-shunt";
  myInterface.navBarShunt.setAttribute('draggable', 'true'); // so you can't select text
  document.body.appendChild(myInterface.navBarShunt);

  // Container so bootstrap centers
  myInterface.navContainer = document.createElement("div");
  myInterface.navContainer.id = "navContainer";
  myInterface.navContainer.className = "container";
  myInterface.navBar.appendChild(myInterface.navContainer);

  // Responsive header
  myInterface.navResponsiveHeader = document.createElement("div");
  myInterface.navResponsiveHeader.id = "navResponsiveHeader";
  myInterface.navResponsiveHeader.className = "navbar-header";
  myInterface.navContainer.appendChild(myInterface.navResponsiveHeader);

  // Navbar toggle button when small presentation
  var iconBar = '<span class="icon-bar"></span>';
  myInterface.navBarToggle = document.createElement("button");
  myInterface.navBarToggle.id = "navBarToggle";
  myInterface.navBarToggle.className = "navbar-toggle";
  myInterface.navBarToggle.setAttribute('type', 'button');
  myInterface.navBarToggle.setAttribute('data-toggle', 'collapse');
  myInterface.navBarToggle.setAttribute('data-target', '.navbar-collapse');
  myInterface.navBarToggle.innerHTML = iconBar + iconBar + iconBar;
  myInterface.navResponsiveHeader.appendChild(myInterface.navBarToggle);

//  // Message Icon
//  myInterface.navEmail2 = document.createElement("button");
//  myInterface.navEmail2.className = "navbar-toggle navbar-icons";
//  myInterface.navEmail2.innerHTML = '<a href="#" class="navbar-icons"><i class="fa fa-envelope"> <span class="badge blue-badge">999</span></a>';
//  myInterface.navResponsiveHeader.appendChild(myInterface.navEmail2);
//
//  // Calendar Icon
//  myInterface.navCalendar2 = document.createElement("button");
//  myInterface.navCalendar2.className = "navbar-toggle navbar-icons";
//  myInterface.navCalendar2.innerHTML = '<a href="#" class="navbar-icons"><i class="fa fa-calendar"> <span class="badge blue-badge">999</span></a>';
//  myInterface.navResponsiveHeader.appendChild(myInterface.navCalendar2);

  // Brand
  myInterface.navBarBrand = document.createElement("a");
  myInterface.navBarBrand.id = "navBarBrand";
  myInterface.navBarBrand.className = "navbar-brand";
  myInterface.navBarBrand.innerHTML = '<a href="javascript:myInterface.homePanel()">' + 'tequila.js' + '</a>';
  myInterface.navResponsiveHeader.appendChild(myInterface.navBarBrand);

  // Collapsible navbar
  myInterface.collapsibleNavBar = document.createElement("div");
  myInterface.collapsibleNavBar.id = "collapsibleNavBar";
  myInterface.collapsibleNavBar.className = "navbar-collapse collapse";
  myInterface.collapsibleNavBar.setAttribute('role', 'navigation');
  myInterface.navContainer.appendChild(myInterface.collapsibleNavBar);

  // navbar list
  myInterface.navList = document.createElement("ul");
  myInterface.navList.id = "navList";
  myInterface.navList.className = "nav navbar-nav";
  myInterface.collapsibleNavBar.appendChild(myInterface.navList);

  myInterface.stooges = myInterface.renderNavBarListMenu(myInterface.navList, 'Contacts');
  myInterface.renderNavBarListItem(myInterface.stooges, 'Moe');
  myInterface.renderNavBarListItem(myInterface.stooges, 'Larry');
  myInterface.renderNavBarListItem(myInterface.stooges, 'Curly');

  myInterface.fruit = myInterface.renderNavBarListMenu(myInterface.navList, 'Projects');
  myInterface.renderNavBarListItem(myInterface.fruit, 'Apple');
  myInterface.renderNavBarListItem(myInterface.fruit, 'Banana');
  myInterface.renderNavBarListItem(myInterface.fruit, 'Cherry');
  myInterface.renderNavBarListItem(myInterface.fruit, 'Peach');

  myInterface.superhero = myInterface.renderNavBarListMenu(myInterface.navList, 'Customers');
  myInterface.renderNavBarListItem(myInterface.superhero, 'Superman');
  myInterface.renderNavBarListItem(myInterface.superhero, 'Batman');
  myInterface.renderNavBarListItem(myInterface.superhero, 'Spiderman');

  myInterface.vendor = myInterface.renderNavBarListMenu(myInterface.navList, 'Vendors');
  myInterface.renderNavBarListItem(myInterface.vendor, 'Lex Luther');
  myInterface.renderNavBarListItem(myInterface.vendor, 'Tom');
  myInterface.renderNavBarListItem(myInterface.vendor, 'Jerry');

  myInterface.pns = myInterface.renderNavBarListMenu(myInterface.navList, 'Product');
  myInterface.renderNavBarListItem(myInterface.pns, 'Meth');
  myInterface.renderNavBarListItem(myInterface.pns, 'Crack');

  myInterface.fin = myInterface.renderNavBarListMenu(myInterface.navList, 'Financial');
  myInterface.renderNavBarListItem(myInterface.fin, 'Wooden Nickel');
  myInterface.renderNavBarListItem(myInterface.fin, 'Sawbuck');

  // Message Icon
  myInterface.navEmail = document.createElement("li");
  myInterface.navEmail.className = "navbar-icons navbar-icon-gap";
  myInterface.navEmail.innerHTML = '<a href="#" class="navbar-icons"><i class="fa fa-envelope"> <span class="badge blue-badge">999</span></a>';
  myInterface.navList.appendChild(myInterface.navEmail);

  // Calendar Icon
  myInterface.navCalendar = document.createElement("li");
  myInterface.navCalendar.className = "navbar-icons";
  myInterface.navCalendar.innerHTML = '<a href="#" class="navbar-icons"><i class="fa fa-calendar"> <span class="badge blue-badge">999</span></a>';
  myInterface.navList.appendChild(myInterface.navCalendar);

  // User Drop Down
  myInterface.navListRight = document.createElement("ul");
  myInterface.navListRight.id = "navListRight";
  myInterface.navListRight.className = "nav navbar-nav navbar-right";
  myInterface.collapsibleNavBar.appendChild(myInterface.navListRight);

  myInterface.user = myInterface.renderNavBarListMenu(myInterface.navListRight, '<i class="fa fa-user fa-lg"></i> <i class="fa navbar-user-name">Guest0123456789</i>');
  myInterface.renderNavBarListItem(myInterface.user, 'Organization','<i class="fa fa-sitemap"></i> ');
  myInterface.renderNavBarListItem(myInterface.user, 'Options','<i class="fa fa-gear"></i> ');
  myInterface.renderNavBarListItem(myInterface.user, 'Logout','<i class="fa fa-sign-out"></i> ');

};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Item
// -------------------------------------------------------------------------------------------------------------------
myInterface.navPicked = function (label) {
  var action = {};
  action.label = label;
  switch (label) {
    case 'Contacts':
      action.style = 'info';
      break;
    case 'Customers':
      action.style = 'dude';
      break;
    case 'Vendors':
      action.style = 'danger';
      break;
    case 'Projects':
      action.style = 'sweet';
      break;
    case 'Products & Services':
      action.style = 'warning';
      break;
    case 'Financial':
      action.style = 'success';
      break;
    case 'Organization':
      action.style = 'primary';
      break;
    case 'Options':
      action.style = 'default';
      action.type = 'options';
      break;
  }
  myInterface.renderPanel(action);
};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Item
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderNavBarListItem = function (parent, label, icon) {
  var listItem = document.createElement('li');
  icon = icon || '';
  var html = '<a href="javascript:myInterface.navPicked(\'' + label + '\')">' + icon + label + '</a>';
  console.log(html);
  listItem.innerHTML = html;
  parent.appendChild(listItem);
};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Menu
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderNavBarListMenu = function (parent, name) {

  var dropDown = document.createElement('li');
  dropDown.className = "dropdown";
  dropDown.innerHTML = '<a href="#" class="dropdown-toggle navbar-menu" data-toggle="dropdown">' + name + '<b class="caret"></b></a>'
  parent.appendChild(dropDown);

  var dropDownMenu = document.createElement('ul');
  dropDownMenu.className = "dropdown-menu";
  dropDown.appendChild(dropDownMenu);

  return dropDownMenu;
};
