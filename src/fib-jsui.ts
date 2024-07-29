outlets = 1;
autowatch = 1;

sketch.default2d();
sketch.glloadidentity();
sketch.glortho(0., 1, -0.5, 0.5, -1, 1.);
let uiPattern: Step[] = [];
var utils = {
  scale: function (array: number[], newMin: number, newMax: number) {

    // get range
    let min: number = array[0]
    let max: number = array[0];
    for (var i = 1; i < array.length; i++) {
      if (min === null || array[i] < min) { min = array[i]; }
      if (max === null || array[i] > max) { max = array[i]; }
    }
    const range = max - min;
    const newRange = newMax - newMin;
    const coeff = range ? newRange / Math.floor(range) : 0.0;
    const offset = newMin - (min * coeff);

    var returnArray = [];
    for (let i = 0; i < array.length; i++) {
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
  HSLToRGB: function (h: number, s: number, l: number) {
    //exports.log({ h: h, s: s, l: l });

    var c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c / 2,
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
      }
      else if (message === null) {
        post("<null>");
      }
      else {
        post(message);
      }
    }
    post("\n");
  }
};

var OUTLET_DURATION = 0;

function flash(idx: string) {
  const flashIdx = parseInt(idx);
  uiPattern[flashIdx].is_on = true
  draw();
  refresh();
  var t = new Task(function () {
    uiPattern[flashIdx].is_on = false
    draw();
    refresh();
  });
  t.schedule(uiPattern[flashIdx].duration);
}

function draw() {
  sketch.glclearcolor(1.0, 1.0, 1.0, 0);
  sketch.glclear();

  const offsets = utils.scale(uiPattern.map(function (tap) { return tap.time_offset; }), -3, 4);

  for (var i = 0; i < uiPattern.length; i++) {
    const tap = uiPattern[i];
    sketch.moveto(offsets[i], 0.05);
    // set foreground color
    const hue = (360 + (30 * tap.note_incr) % 360) % 360;
    //utils.log(tap.note_incr);
    //utils.log(hue);

    // ability to flash the border
    var circleBorder = 0;
    if (tap.is_on) {
      circleBorder = 1;
    }

    // outer circle
    //utils.log("idx: " + i + "  circleBorder: " + circleBorder);
    sketch.glcolor(circleBorder, circleBorder, circleBorder, 1);
    sketch.circle(0.28 * tap.velocity_coeff, 0, 360);

    // inner colored circle
    const color = utils.HSLToRGB(hue, .75, .60);
    sketch.glcolor(color.r, color.g, color.b, 1);
    sketch.circle(0.25 * tap.velocity_coeff, 0, 360);
  }
  sketch.glcolor(0, 0, 0, 1.0);

  if (uiPattern.length > 0) {
    sketch.textalign("center", "center");
    sketch.glcolor(1, 1, 1, 1);
    outlet(OUTLET_DURATION, Math.floor(uiPattern[uiPattern.length - 1].time_offset) / 1000.0);
  }
}

function update() {
  uiPattern = arrayfromargs(arguments); // magical M4L js function
  //utils.log("HEAD: " + JSON.stringify(uiPattern[0]));
  //utils.log("Received: " + JSON.stringify(uiPattern));
  draw();
  refresh();
}

function forcesize(w: number, h: number) {
  if (w != h * 8) {
    h = Math.floor(w / 8);
    w = h * 8;
    (box as any).size(w, h);
  }
}
forcesize.local = 1; //private

function onresize(w: number, h: number) {
  forcesize(w, h);
  draw();
  refresh();
}
onresize.local = 1; //private

draw();
