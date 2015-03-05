// Keep everything in anonymous function, called on window load.
if(window.addEventListener) {
window.addEventListener('load', function () {

  var canvas, context, canvaso, contexto;

  // The active tool instance.
  var tool;
  var currentTool = 'line';
  var color_black = '#434A54'
  var color_white='#F5F7FA'
  var nodeColor = color_black;
  var widthLine = 5;
  var fill = false;

  function init () {

    // Find the canvas element.
    canvaso = document.getElementById('imageView');

    // Get the 2D canvas context 
    contexto = canvaso.getContext('2d'); 

    // Add the temporary canvas.
    var container = canvaso.parentNode;
    canvas = document.createElement('canvas');

    // set data of canvas node - insert new canvas
    canvas.id     = 'imageTemp';
    canvas.width  = canvaso.width;
    canvas.height = canvaso.height;
    container.appendChild(canvas); // set the canvas 
    context = canvas.getContext('2d');
    context.lineWidth=widthLine;
    context.strokeStyle = nodeColor;    
    // Attach the mousedown, mousemove and mouseup event listeners to canvas obj.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);



    // set listener for draw tools
    $('#tools .btn').click(function() { 
      $('#'+currentTool).css({ 'color': color_white});
      // deselect old color
      //nononono$('#tools .btn').css({ 'color': color_black});
      $('#'+this.id).css({ 'color': color_black});
      // select new color

      tool = new tools[this.id](); 

      currentTool = this.id;

    });

    // New Painting
    $('#remove').click(function() { contexto.clearRect(0, 0, canvas.width, canvas.height);});

    // set default color
    $('#\\'+ nodeColor +' h4').css({ 'color':color_white});

    // set listener for color set
    $('#colors .btn').click(function() { 
      // deselect old color
      if (nodeColor) $('#\\'+ nodeColor +' h4').css({ 'color': nodeColor});

      // select new color
      nodeColor = this.id;
      $('#\\'+ nodeColor +' h4').css({ 'color': color_white});
      context.strokeStyle = nodeColor;
      $( "#tint" ).trigger( "click" );
      $( "#tint" ).trigger( "click" );

    });

    // control for the thickness of the borad shapes' 
    $('#thickness').on("change", function() { 
      if ($(this).val() == 0){
        context.lineWidth=0.5;
      }else{
        context.lineWidth= $(this).val();
      }
    });

    // control for the tint of the shapes
    $('#tint').click(function() {
      if (fill){
        fill = false;
        $('#tint i').css({ 'color':color_white});
        // se è la seconda volta che lo clicchiamo torna bianco
      }else{
        $('#tint  i').css({ 'color':nodeColor});
        fill = true;        
      }
    });

  }

  // The general-purpose event handler. 
  // This function just determines the mouse position relative to the canvas element.
  function ev_canvas (ev) {
    ev._x = ev.layerX;
    ev._y = ev.layerY;

    // Call the event handler of the tool. ???
    var func = tool[ev.type];
    if (func) func(ev);
  }

  // This function draws the #imageTemp canvas on top of #imageView, after which 
  // #imageTemp is cleared. This function is called each time when the user 
  // completes a drawing operation. 
  function img_update () {
    contexto.drawImage(canvas, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // This object holds the implementation of each drawing tool.
  var tools = {};

  // The drawing pencil.
  tools.pencil = function () {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        if (fill){
          context.fillStyle = nodeColor;
          context.fill();
        }
        img_update();
      }
    };
  };

  // The rectangle tool.
  tools.rect = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x = Math.min(ev._x,  tool.x0),
          y = Math.min(ev._y,  tool.y0),
          w = Math.abs(ev._x - tool.x0),
          h = Math.abs(ev._y - tool.y0);


      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h) {
        return;
      }
      context.strokeRect(x, y, w, h);
      if (fill){
        context.fillStyle = nodeColor;
        context.fillRect(x, y, w, h);
      }
    };

    this.mouseup = function (ev) {
      if (tool.started) {

        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The line tool.
  tools.line = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.moveTo(tool.x0, tool.y0);
      context.lineTo(ev._x,   ev._y);
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) { 
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The circle tool.
  tools.circle = function () {
    var tool = this;
    this.started = false;

    //draw a circle

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();

      diametro = ev._x - tool.x0;
      if (diametro < 0) diametro*-1;
      context.arc(ev._x, ev._y, diametro, 0, 2 * Math.PI, false);
      context.stroke();
      if (fill){
          context.fillStyle = nodeColor;
          context.fill();
        }
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) { 
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  init();

}, false); }

