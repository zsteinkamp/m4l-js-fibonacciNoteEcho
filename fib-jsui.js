autowatch=1;
sketch.default2d();
sketch.glloadidentity();
sketch.glortho(0., 1, -0.5, 0.5, -1,1.);
var pattern = [];

function draw()
{
  sketch.glclearcolor(1.0, 1.0, 1.0, 1.0);
  sketch.glclear();

  var maxMs = 0;
  var minNote = 0;
  var maxNote = 0;
  var tap;
  var offset;
  var color;
  for (var i = 0; i < pattern.length; i++) {
    tap = pattern[i];
    if (tap.time_offset > maxMs) { maxMs = tap.time_offset; }
    if (tap.note_incr > maxNote) { maxNote = tap.note_incr; }
    if (tap.note_incr < minNote) { minNote = tap.note_incr; }
  }

  var noteRange = maxNote - minNote;

  //log("MaxMS=" + maxMs);

  for (var i = 0; i < pattern.length; i++) {
    tap = pattern[i];
    offset = maxMs ? (7 * (tap.time_offset / maxMs)) - 3 : 0.5;
    sketch.moveto(offset, 0.05);
    //log("Tap: " + JSON.stringify(tap) + " - " + parseInt(100*offset) + " - min: " + minNote + " - max: " + maxNote + " - range: " + noteRange);
    // set foreground color
    hue = (360 + (30 * tap.note_incr) % 360) % 360;
    //log(tap.note_incr);
    //log(hue);
    color = HSLToRGB(hue, 80, 40);
    sketch.glcolor(color.r, color.g, color.b, 1.0);
    sketch.circle(0.25 * tap.velocity_coeff);
  }
  sketch.glcolor(0, 0, 0, 1.0);
  sketch.moveto(0.5, -.4);
  if (pattern.length > 0) {
    sketch.textalign("center");
    sketch.text("<--- Total " + parseInt(pattern[pattern.length - 1].time_offset)/1000 + " seconds --->");
  }
}

function HSLToRGB(h,s,l) {
  //log({ h: h, s: s, l: l });

  // Must be fractions of 1
  s /= 100;
  l /= 100;

  var c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0,
      b = 0;
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  return {
    r: r + m,
    g: g + m,
    b: b + m
  };
}

function junk(data) {
  pattern = arrayfromargs(arguments);
  //log("HEAD: " + JSON.stringify(pattern[0]));
  //log("Received: " + JSON.stringify(pattern));
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

function log() {
  for(var i=0,len=arguments.length; i<len; i++) {
    var message = arguments[i];
    if(message && message.toString) {
      var s = message.toString();
      if(s.indexOf("[object ") >= 0) {
        s = JSON.stringify(message);
      }
      post(s);
    }
    else if(message === null) {
      post("<null>");
    }
    else {
      post(message);
    }
  }
  post("\n");
}
