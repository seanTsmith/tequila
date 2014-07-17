// Initialize your app
var app = new Framework7();

// Export selectors engine
var $$ = Framework7.$;

// Add view
var mainView = app.addView('.view-main', {
  // Because we use fixed-through navbar we can enable dynamic navbar
  dynamicNavbar: true
});

// Callbacks to run specific code for specific pages, for example for About page:
app.onPageInit('about', function (page) {
  // run createContentPage func after link was clicked
  $$('.create-page').on('click', function () {
    createContentPage();
  });
});

// <div data-page="index" class="page">
app.onPageInit('index', function (page) {
  console.log('onPageInit');
});
app.onPageBeforeAnimation('index', function (page) {
  console.log('onPageBeforeAnimation');
  mainView.showToolbar();
});
app.onPageAfterAnimation('index', function (page) {
  console.log('onPageAfterAnimation');
});


// Generate dynamic page
function createContentPage() {
  mainView.loadContent(

      '<div class="pages navbar-through">' +
      '  <div data-page="no-navbar-toolbar" class="page no-navbar no-toolbar">' +
      '    <div class="page-content">' +
      '      <div class="content-block">' +
      '<h1>WHAT IT DO</h1>' +
      '        <p>On this page Navbar and Toolbar were hidden dynamically. Just add "no-toolbar no-navbar" class to this page to make it work.</p>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
  );

  setTimeout(function () {
    mainView.goBack();
  }, 1000);



}


$$(document).on('click', '.app-hello', function () {
  // Looks better if done after transition completes
  $$('.panel.active').transitionEnd(function () {
    app.alert('sup foo');
  });
  app.closePanel();
});

$$(document).on('click', '.app-info', function () {
  createContentPage();
});

$$(document).on('click', '.app-form', function () {
  app.showPreloader('Loading');
  mainView.loadContent(
      '<div class="navbar">' +
      '  <div class="navbar-inner">' +
      '    <div class="left sliding"><a href="#" class="back link"><i class="icon icon-back-blue"></i><span>Back</span></a></div>' +
      '    <div class="center sliding">' +
      '      <div class="buttons-row">' +
      '        <a href="#tab1" class="button active tab-link">Tab 1</a>' +
      '        <a href="#tab2" class="button tab-link">Tab 2</a>' +
      '        <a href="#tab3" class="button tab-link">Tab 3</a>' +
      '        <a href="#tab3" class="button tab-link">Tab 4</a>' +
      '        <a href="#tab3" class="button tab-link">Tab 5</a>' +
      '        <a href="#tab3" class="button tab-link">Tab 6</a>' +
        '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
        '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
        '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
        '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
        '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
        '        <a href="#tab3" class="button tab-link">Tab 7</a>' +
      '      </div>' +
      '    </div>' +
      '    <div class="right"><a href="#" class="link open-panel icon-only"><i class="icon icon-bars-blue"></i></a></div>' +
      '  </div>' +
      '</div>' +
      '<div class="pages navbar-through">' +
      '  <div data-page="tabs" class="page">' +
      '    <div class="page-content">' +
      '      <div class="tabs">' +
      '        <div id="tab1" class="tab active">' +
      '          <div class="content-block">' +
      '            <p>This is tab 1 content</p>' +
      '            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum mi quis felis scelerisque faucibus. Aliquam ut commodo justo. Mauris vitae pharetra arcu. Sed tincidunt dui et nibh auctor pretium. Nam accumsan fermentum sem. Suspendisse potenti. Nulla sed orci malesuada, pellentesque elit vitae, cursus lorem. Praesent et vehicula sapien, ut rhoncus quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vitae mi nec lorem aliquet venenatis quis nec nibh. Aenean sit amet leo ligula. Fusce in massa et nisl dictum ultricies et vitae dui. Sed sagittis quis diam sed lobortis. Donec in massa pharetra, tristique purus vitae, consequat mauris. Aliquam tellus ante, pharetra in mattis ut, dictum quis erat.</p>' +
      '            <p>Ut ac lobortis lacus, non pellentesque arcu. Quisque sodales sapien malesuada, condimentum nunc at, viverra lacus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus eu pulvinar turpis, id tristique quam. Aenean venenatis molestie diam, sit amet condimentum nisl pretium id. Donec diam tortor, mollis in vehicula id, vehicula consectetur nulla. Quisque posuere rutrum mauris, eu rutrum turpis blandit at. Proin volutpat tortor sit amet metus porttitor accumsan. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Ut dapibus posuere dictum.</p>' +
      '          </div>' +
      '        </div>' +
      '        <div id="tab2" class="tab">' +
      '          <div class="content-block">' +
      '            <p>This is tab 2 content</p>' +
      '            <p>Ut ac lobortis lacus, non pellentesque arcu. Quisque sodales sapien malesuada, condimentum nunc at, viverra lacus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus eu pulvinar turpis, id tristique quam. Aenean venenatis molestie diam, sit amet condimentum nisl pretium id. Donec diam tortor, mollis in vehicula id, vehicula consectetur nulla. Quisque posuere rutrum mauris, eu rutrum turpis blandit at. Proin volutpat tortor sit amet metus porttitor accumsan. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Ut dapibus posuere dictum.</p>' +
      '            <p>Fusce luctus turpis nunc, id porta orci blandit eget. Aenean sodales quam nec diam varius, in ornare ipsum condimentum. Aenean eleifend, nulla sit amet volutpat adipiscing, ligula nulla pharetra risus, vitae consequat leo tortor eu nunc. Vivamus at fringilla metus. Duis neque lectus, sagittis in volutpat a, pretium vel turpis. Nam accumsan auctor libero, quis sodales felis faucibus quis. Etiam vestibulum sed nisl vel aliquet. Aliquam pellentesque leo a lacus ultricies scelerisque. Vestibulum vestibulum fermentum tincidunt. Proin eleifend metus non quam pretium, eu vehicula ipsum egestas. Nam eget nibh enim. Etiam sem leo, pellentesque a elit vel, egestas rhoncus enim. Morbi ultricies adipiscing tortor, vitae condimentum lacus hendrerit nec. Phasellus laoreet leo quis purus elementum, ut fringilla justo eleifend. Nunc ultricies a sapien vitae auctor. Aliquam id erat elementum, laoreet est et, dapibus ligula.</p>' +
      '          </div>' +
      '        </div>' +
      '        <div id="tab3" class="tab">' +
      '          <div class="content-block">' +
      '            <p>This is tab 3 content</p>' +
      '            <p>Nulla gravida libero eget lobortis iaculis. In sed elit eu nibh adipiscing faucibus. Sed ac accumsan lacus. In ut diam quis turpis fringilla volutpat. In ultrices dignissim consequat. Cras pretium tortor et lorem condimentum posuere. Nulla facilisi. Suspendisse pretium egestas lacus ac laoreet. Mauris rhoncus quis ipsum quis tristique. Vivamus ultricies urna quis nunc egestas, in euismod turpis fringilla. Nam tellus massa, vehicula eu sapien non, dapibus tempor lorem. Fusce placerat orci arcu, eu dignissim enim porttitor vel. Nullam porttitor vel dolor sed feugiat. Suspendisse potenti. Maecenas ac mattis odio. Sed vel ultricies lacus, sed posuere libero.</p>' +
      '            <p>Nulla gravida libero eget lobortis iaculis. In sed elit eu nibh adipiscing faucibus. Sed ac accumsan lacus. In ut diam quis turpis fringilla volutpat. In ultrices dignissim consequat. Cras pretium tortor et lorem condimentum posuere. Nulla facilisi. Suspendisse pretium egestas lacus ac laoreet. Mauris rhoncus quis ipsum quis tristique. Vivamus ultricies urna quis nunc egestas, in euismod turpis fringilla. Nam tellus massa, vehicula eu sapien non, dapibus tempor lorem. Fusce placerat orci arcu, eu dignissim enim porttitor vel. Nullam porttitor vel dolor sed feugiat. Suspendisse potenti. Maecenas ac mattis odio. Sed vel ultricies lacus, sed posuere libero.</p>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
  );
  setTimeout(function () {
    app.hidePreloader();
  }, 250);
});



$$(document).on('click', '.app-cheers', function () {

//  $$('.tabbar').hide();

  mainView.hideToolbar();

  mainView.loadContent(
      '<div class="navbar">' +
      '  <div class="navbar-inner">' +
      '    <div class="left"><a href="#" class="back link"><i class="icon icon-back-blue"></i><span>Back</span></a></div>' +
      '    <div class="center sliding">Cheers Mate!</div>' +
      '  </div>' +
      '</div>' +
      '<div class="pages">' +
      '  <div data-page="dynamic-pages" class="page">' +
      '    <div class="page-content">' +
      '      <div class="content-block">' +
      '        <div class="content-block-inner">' +
      '          <p>Tequila is a distilled beverage made from the blue agave plant, primarily in the area surrounding the city of Tequila, 65 km northwest of Guadalajara, and in the highlands of the north western Mexican state of Jalisco.</p>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
  );
});
