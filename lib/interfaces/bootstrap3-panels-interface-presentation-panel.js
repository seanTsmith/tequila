/**
 * tequila
 * bootstrap3-panels-interface-presentation-panel
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Handler: presentation
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.registerPresentationPanel = function (self, panel, action) {

  var i, j;
  var panelBody = panel.panelBody;

  // Get the presentation contents
  var contents = action.request.command.contents.get('contents');
  var panelWell, panelForm, formGroup, label, inputDiv, input, select, sz, button, buttonDiv;

  panelWell = document.createElement("div");
  panelWell.className = 'well-panel';
  panelBody.appendChild(panelWell);

  panelForm = document.createElement("form");
  panelForm.className = 'form-horizontal';
  panelWell.appendChild(panelForm);

  for (i = 0; i < contents.length; i++) {

    // String markdown or seperator '-'
    if (typeof contents[i] == 'string') {
      if (contents[i] == '-') {
        panelForm.appendChild(document.createElement("hr"));
      } else {
        var txtDiv = document.createElement("div");
        txtDiv.innerHTML = markdown.toHTML(contents[i]);
        panelForm.appendChild(txtDiv);
      }
    }

    // Attributes
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

      //quickPick

      if (contents[i].quickPick) {

        var inputGroup;
        inputGroup = document.createElement("div");
        inputGroup.className = 'input-group';
        inputDiv.appendChild(inputGroup);

        input = document.createElement("input");
        input.className = 'form-control';
        //      input.readOnly = true; // TODO when needed this is how we do it
        if (contents[i].placeHolder)
          input.setAttribute("placeHolder", contents[i].placeHolder);
        input.setAttribute("type", "text");
        input.setAttribute("maxlength", contents[i].size);
        if (contents[i].value)
          input.setAttribute("value", contents[i].value);
        inputGroup.appendChild(input);

        var inputGroupButtonSpan = document.createElement("div");
        inputGroupButtonSpan.className = 'input-group-btn';
        inputGroup.appendChild(inputGroupButtonSpan);

        var inputGroupButton = document.createElement("button");
        inputGroupButton.type = 'button';
        inputGroupButton.className = 'btn btn-default dropdown-toggle';
        inputGroupButton.setAttribute('data-toggle', 'dropdown');
        inputGroupButton.innerHTML = '<span class="caret"></span>';
        inputGroupButtonSpan.appendChild(inputGroupButton);

        var shitDick = contents[i].quickPick;
        var dropDownMenu = document.createElement("ul");
        dropDownMenu.className = 'dropdown-menu pull-right';
        var daList = '';
        for (j = 0; j < shitDick.length; j++) {
          daList += '<li><a href="#">' + shitDick[j] + '</a></li>';
        }
        dropDownMenu.innerHTML = daList;
        inputGroupButtonSpan.appendChild(dropDownMenu);
        dropDownMenu.onclick = function (ele, peepee) {
          input.setAttribute("value", ele.srcElement.innerText);
        };


      } else {
        input = document.createElement("input");
        input.className = 'form-control';
        //      input.readOnly = true; // TODO when needed this is how we do it
        if (contents[i].placeHolder)
          input.setAttribute("placeHolder", contents[i].placeHolder);
        input.setAttribute("type", "text");
        input.setAttribute("maxlength", contents[i].size);
        if (contents[i].value)
          input.setAttribute("value", contents[i].value);
        inputDiv.appendChild(input);
      }
    }

    // Commands
    if (contents[i] instanceof Command) {

      if (!buttonDiv) {
        formGroup = document.createElement("div");
        formGroup.className = 'form-group';
        panelForm.appendChild(formGroup);

        buttonDiv = document.createElement("div");
        buttonDiv.className = 'col-sm-offset-3 col-sm-9';
        formGroup.appendChild(buttonDiv);
      } else {
      }
      var cmdTheme = contents[i].theme || 'default';
      button = document.createElement("a");
      button.className = 'btn btn-' + cmdTheme + ' btn-presentation';
      if (contents[i].icon)
        button.innerHTML = '<i class="fa ' + contents[i].icon + ' "></i> ' + contents[i].name;
      else
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

  return true;
};
