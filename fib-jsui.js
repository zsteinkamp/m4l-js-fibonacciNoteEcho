autowatch=1;
sketch.default2d();
sketch.glloadidentity();
sketch.glortho(0., 1, -0.5, 0.5, -1,1.);
var pattern = [];
var utils = require("utils.js");

function draw()
{
  sketch.glclearcolor(1.0, 1.0, 1.0, 0);
  sketch.glclear();

  var tap;
  var color;

  var offsets = utils.scale(pattern.map( function(tap) { return tap.time_offset; } ), -3, 4);

  for (var i = 0; i < pattern.length; i++) {
    tap = pattern[i];
    sketch.moveto(offsets[i], 0.05);
    // set foreground color
    hue = (360 + (30 * tap.note_incr) % 360) % 360;
    //utils.log(tap.note_incr);
    //utils.log(hue);

    // outer black circle
    sketch.glcolor(0, 0, 0, 1);
    sketch.circle(0.28 * tap.velocity_coeff);

    // inner colored circle
    color = utils.HSLToRGB(hue, .75, .60);
    sketch.glcolor(color.r, color.g, color.b, 1);
    sketch.circle(0.25 * tap.velocity_coeff);
  }
  sketch.glcolor(0, 0, 0, 1.0);
  sketch.moveto(0.5, -.4);
  if (pattern.length > 0) {
    sketch.textalign("center");
    sketch.glcolor(1,1,1,1);
    sketch.text("<--- Total " + parseInt(pattern[pattern.length - 1].time_offset)/1000 + " seconds --->");
  }
}

function update(data) {
  pattern = arrayfromargs(arguments); // magical M4L js function
  //utils.log("HEAD: " + JSON.stringify(pattern[0]));
  //utils.log("Received: " + JSON.stringify(pattern));
  draw();
  refresh();
}

function onresize(w,h)
{
	log(w,h);
	draw();
	refresh();
}
onresize.local = 1; //private

function forcesize(w,h)
{
  if (w!=h*8) {
    h = Math.floor(w/8);
    w = h*8;
    box.size(w,h);
  }
}
forcesize.local = 1; //private

function onresize(w,h)
{
  forcesize(w,h);
  draw();
  refresh();
}
onresize.local = 1; //private

draw();
