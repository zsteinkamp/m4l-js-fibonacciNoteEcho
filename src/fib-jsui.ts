outlets = 1;
autowatch = 1;

const OUTLET_DUR = 0;

const ASPECT = 400 / 111;

sketch.default2d();
sketch.glloadidentity();

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

    return returnArray;
  },
  log: function (_: any) {
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

const COLOR_BG = max.getcolor('live_lcd_bg')
const COLOR_LINE = max.getcolor('live_lcd_frame')
const COLOR_TITLE = max.getcolor('live_lcd_title')

const colors: Color[] = [
  // generated at https://supercolorpalette.com/?scp=G0-lch-FF6561-F58126-C49C00-84AE04-00B950-00BE93-00BFD5-00BAFF-00AEFF-7397FF-DA79F8-FF5DBC
  // using the 'LCH' color model
  "#FF6561",
  "#F58126",
  "#C49C00",
  "#84AE04",
  "#00B950",
  "#00BE93",
  "#00BFD5",
  "#00BAFF",
  "#00AEFF",
  "#7397FF",
  "#DA79F8",
  "#FF5DBC"
].map((hex: string) => {
  const matches = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return matches ? [
    parseInt(matches[1], 16) / 255.0,
    parseInt(matches[2], 16) / 255.0,
    parseInt(matches[3], 16) / 255.0,
    1
  ] : [0, 0, 0, 1];
})

function draw() {
  sketch.glclearcolor(COLOR_BG);
  sketch.glclear();
  sketch.fontsize(9.5);

  const offsets = utils.scale(uiPattern.map(function (tap) { return tap.time_offset; }), -(ASPECT * 0.8), ASPECT * .8);

  //for (var i = uiPattern.length - 1; i >= 0; i--) {
  for (var i = 0; i < uiPattern.length; i++) {
    const tap = uiPattern[i];
    sketch.moveto(offsets[i], 0);

    // ability to flash the border
    var circleBorder = COLOR_LINE;
    if (tap.is_on) {
      circleBorder = COLOR_TITLE
    }

    const diameter = 0.33 * tap.velocity_coeff

    // outer circle
    //utils.log("idx: " + i + "  circleBorder: " + circleBorder);
    sketch.glcolor(circleBorder);
    sketch.circle(0.02 + diameter, 0, 360);

    // inner colored circle
    const color = colors[(1152 + tap.note_incr) % colors.length]
    sketch.glcolor(color);
    sketch.circle(diameter, 0, 360);
    sketch.glcolor(COLOR_BG);
    sketch.text(tap.fib.toString())
    //utils.log(tap.fib.toString())
  }
  sketch.glcolor(COLOR_LINE);

  if (uiPattern.length > 0) {
    sketch.textalign("center", "center");
    sketch.glcolor(COLOR_TITLE);
    outlet(OUTLET_DUR, Math.floor(uiPattern[uiPattern.length - 1].time_offset));
  }
}

function update() {
  uiPattern = arrayfromargs(arguments); // magical M4L js function
  //utils.log("HEAD: " + JSON.stringify(uiPattern[0]));
  //utils.log("Received: " + JSON.stringify(uiPattern));
  draw();
  refresh();
}