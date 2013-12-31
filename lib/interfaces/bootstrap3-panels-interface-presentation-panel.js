/**
 * tequila
 * bootstrap3-panels-interface-presentation-panel
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Handler: presentation
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.registerPresentationPanel = function (self, panel, action) {

  var panelBody = panel.panelBody;
  var panelTitle = panel.panelTitle;

  // Get the presentation contents
  var contents = action.request.command.contents.get('contents');
  var panelWell, panelForm, formGroup, label, inputDiv, input, sz, button, buttonDiv;

  panelWell = document.createElement("div");
  panelWell.className = 'well-panel';
  panelBody.appendChild(panelWell);

  panelForm = document.createElement("form");
  panelForm.className = 'form-horizontal';
  panelWell.appendChild(panelForm);

  // test paragraph and heading
  var head = document.createElement("H4");
  head.className = 'header-presentation';
  head.innerHTML = 'WHAT IT DO';
  panelForm.appendChild(head);

  var par = document.createElement("p");
  par.innerHTML = 'This is text This is text This is text This is text This is text This is text This is text This is ' +
    'text This is text This is text This is text This is text This is text This is text This is text This is text ' +
    'This is text This is text This is text This is text This is text This is text This is text This is text...';
  panelForm.appendChild(par);
  var hr = document.createElement("hr");
  panelForm.appendChild(hr);

  for (var i in contents) {
    if (contents[i] instanceof Attribute) {
      // Set with of input based on size of field
      sz = '1';
      if (contents[i].size > 2) sz = '2';
      if (contents[i].size > 5) sz = '3';
      if (contents[i].size > 10) sz = '4';
      if (contents[i].size > 20) sz = '5';
      if (contents[i].size > 25) sz = '6';
      if (contents[i].size > 30) sz = '7';
      if (contents[i].size > 40) sz = '8';
      if (contents[i].size > 50) sz = '9';

      formGroup = document.createElement("div");
      formGroup.className = 'form-group';
      panelForm.appendChild(formGroup);

      label = document.createElement("label");
      label.className = 'col-sm-3 control-label';
      formGroup.appendChild(label);
      label.innerHTML = contents[i].label;

      inputDiv = document.createElement("div");
      inputDiv.className = 'col-sm-' + sz;
      formGroup.appendChild(inputDiv);

      input = document.createElement("input");
      input.className = 'form-control';
      input.readOnly = true; // test
      input.setAttribute("type", "text");
      input.setAttribute("maxlength", contents[i].size);
      if (contents[i].value)
        input.setAttribute("value", contents[i].value);
      inputDiv.appendChild(input);
    }
    if (contents[i] instanceof Command) {

      if (!buttonDiv) {
        formGroup = document.createElement("div");
        formGroup.className = 'form-group';
        panelForm.appendChild(formGroup);

        buttonDiv = document.createElement("div");
        buttonDiv.className = 'col-sm-offset-3 col-sm-9';
        formGroup.appendChild(buttonDiv);
      } else {
//        buttonDiv.appendChild(document.createTextNode("\u00A0")); // non-breaking space
      }
      var cmdTheme = contents[i].theme || 'default';
      button = document.createElement("button");
      button.className = 'btn btn-' + cmdTheme + ' btn-presentation';
      button.innerHTML = contents[i].name;
      buttonDiv.appendChild(button);

      $(button).data('command', contents[i]);
      button.addEventListener('click', function (e) {
        var cmd = $(this).data('command');
        e.preventDefault();
        self.dispatch(new Request({type: 'Command', command: cmd}));
      });

    }
  }

//  var snips = '';
//  for (var i = 1; i <= 10; i++) {
//    var classy = 'col-sm-' + i + '';
////    var snip = '<div class="form-group has-error">' + TODO when error set has-error
//    var lbl = 'label' + i;
//    var snip = '<div class="form-group">' +
//      '<label for="' + lbl + '" class="col-sm-2 control-label">' + classy + '</label>' + // TODO use label for so can click on it for focus?
//      '<div class="' + classy + '">' +
//      '<input id="' + lbl + '" type="text" class="form-control" placeholder="01234567890123456789012345678901234567890123456789012345678901234567890123456789">' +
////      '<span class="help-block">Suck it mofo</span>' + TODO for errors but add on the fly
//      '</div>' +
//      '</div>';
//    snips += snip;
//  }
//  panelForm.innerHTML = snips;

  return true;
};
