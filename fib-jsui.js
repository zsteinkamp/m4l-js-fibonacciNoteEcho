outlets = 1;
autowatch = 1;

sketch.default2d();
sketch.glloadidentity();
sketch.glortho(0, 1, -0.5, 0.5, -1, 1);
var pattern = [];
var utils = {
  scale: function (array, newMin, newMax) {
    // get range
    var min = null;
    var max = null;
    for (var i = 0; i < array.length; i++) {
      if (min === null || array[i] < min) {
        min = array[i];
      }
      if (max === null || array[i] > max) {
        max = array[i];
      }
    }
    var range = max - min;

    var newRange = newMax - newMin;

    var coeff = range ? newRange / parseFloat(range) : 0.0;

    var offset = newMin - min * coeff;

    var returnArray = [];
    for (var i = 0; i < array.length; i++) {
      returnArray.push(array[i] * coeff + offset);
    }

    //exports.log({
    //    min: min,
    //    max: max,
    //    range: range,
    //    newRange: newRange,
    //    coeff: coeff,
    //    offset: offset,
    //    return: returnArray
    //});

    return returnArray;
  },
  HSLToRGB: function (h, s, l) {
    //exports.log({ h: h, s: s, l: l });

    var c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = l - c / 2,
      r = 0,
      g = 0,
      b = 0;
    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }
    return {
      r: r + m,
      g: g + m,
      b: b + m,
    };
  },
  log: function () {
    for (var i = 0, len = arguments.length; i < len; i++) {
      var message = arguments[i];
      if (message && message.toString) {
        var s = message.toString();
        if (s.indexOf("[object ") >= 0) {
          s = JSON.stringify(message);
        }
        post(s);
      } else if (message === null) {
        post("<null>");
      } else {
        post(message);
      }
    }
    post("\n");
  },
};

var OUTLET_DURATION = 0;

var flashIdx = null;

function flash(idx) {
  flashIdx = idx;
  draw();
  refresh();
  var t = new Task(function () {
    flashIdx = null;
    draw();
    refresh();
  });
  t.schedule(250);
}

function draw() {
  sketch.glclearcolor(1.0, 1.0, 1.0, 0);
  sketch.glclear();

  var tap;
  var color;

  var offsets = utils.scale(
    pattern.map(function (tap) {
      return tap.time_offset;
    }),
    -3,
    4
  );

  for (var i = 0; i < pattern.length; i++) {
    tap = pattern[i];
    sketch.moveto(offsets[i], 0.05);
    // set foreground color
    hue = (360 + ((30 * tap.note_incr) % 360)) % 360;
    //utils.log(tap.note_incr);
    //utils.log(hue);

    var circleBorder = 0;
    if (flashIdx === i.toString()) {
      circleBorder = 1;
    }
    // outer circle
    //utils.log("idx: " + i + "  circleBorder: " + circleBorder);
    sketch.glcolor(circleBorder, circleBorder, circleBorder, 1);
    sketch.circle(0.28 * tap.velocity_coeff, 4);

    // inner colored circle
    color = utils.HSLToRGB(hue, 0.75, 0.6);
    sketch.glcolor(color.r, color.g, color.b, 1);
    sketch.circle(0.25 * tap.velocity_coeff);
  }
  sketch.glcolor(0, 0, 0, 1.0);

  if (pattern.length > 0) {
    sketch.textalign("center");
    sketch.glcolor(1, 1, 1, 1);
    outlet(OUTLET_DURATION, parseInt(pattern[pattern.length - 1].time_offset) / 1000.0);
  }
}

function update(data) {
  pattern = arrayfromargs(arguments); // magical M4L js function
  //utils.log("HEAD: " + JSON.stringify(pattern[0]));
  //utils.log("Received: " + JSON.stringify(pattern));
  draw();
  refresh();
}

function onresize(w, h) {
  log(w, h);
  draw();
  refresh();
}
onresize.local = 1; //private

function forcesize(w, h) {
  if (w != h * 8) {
    h = Math.floor(w / 8);
    w = h * 8;
    box.size(w, h);
  }
}
forcesize.local = 1; //private

function onresize(w, h) {
  forcesize(w, h);
  draw();
  refresh();
}
onresize.local = 1; //private

draw();
