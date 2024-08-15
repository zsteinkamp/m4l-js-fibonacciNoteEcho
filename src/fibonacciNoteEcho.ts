inlets = 9
outlets = 4

function log(_: any) {
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

// inlet index -- used to identify an element in the 
// 'options' array defined below
var INLET_NOTE = 0;
var INLET_VELOCITY = 1;
var INLET_TIME_BASE = 2;
var INLET_TIMESCALE = 3;
var INLET_ITERATIONS = 4;
var INLET_DUR_BASE = 5
var INLET_DUR_DECAY = 6;
var INLET_NOTE_INCR = 7;
var INLET_VELOCITY_DECAY = 8;

// the position in the options array corresponds to the inlet index
const options = [
  0,     // INLET_NOTE
  0,     // INLET_VELOCITY
  300,   // INLET_TIME_BASE
  1,     // INLET_TIMESCALE
  4,     // INLET_ITERATIONS
  250,   // INLET_DUR_BASE
  0.667, // INLET_DUR_DECAY
  0,     // INLET_NOTE_INCR
  0.8    // INLET_VELOCITY_DECAY
];

// outlets
var OUTLET_NOTE = 0;
var OUTLET_VELOCITY = 1;
var OUTLET_DURATION = 2;
var OUTLET_JSUI = 3;


let pattern: Step[] = [];

setupPattern();

// Method to calculate the Fibonacci pattern for the current knob values.
function setupPattern() {
  //log(options);
  pattern = [];

  // first note plays immediately
  pattern.push({
    note_incr: 0,
    fib: 0,
    velocity_coeff: 1,
    duration: options[INLET_DUR_BASE],
    time_offset: 0
  });

  var prv = 1;
  var fib = 1;
  var tmp;
  var prv_time_offset = 0;
  var new_time_offset = 0;

  for (var i = 1; i < options[INLET_ITERATIONS]; i++) {
    //log(fib);
    new_time_offset = prv_time_offset + options[INLET_TIMESCALE] * options[INLET_TIME_BASE] * fib

    pattern.push({
      note_incr: i * options[INLET_NOTE_INCR],
      fib,
      velocity_coeff: Math.pow(options[INLET_VELOCITY_DECAY], i),
      duration: options[INLET_DUR_BASE] * Math.pow(options[INLET_DUR_DECAY], i),
      time_offset: new_time_offset
    });
    tmp = fib;
    fib = fib + prv;
    prv = tmp;
    prv_time_offset = new_time_offset;
  }
  //log(pattern);

  // Pass 'update' as the head of the array sent to the JSUI outlet calls the
  // 'update' method in the jsui object with the rest of the pattern array as
  // js args. This results in the visualization being redrawn.
  const updateCmd = 'update' as string | Step
  outlet(OUTLET_JSUI, [updateCmd].concat(pattern));
}


// Returns a function that when executed will send a note of a given pitch,
// velocity, and duration to the outlets.
function makeTask(i: number, p: Step, n: number, v: number) {
  return function () {
    n = n + p.note_incr;
    v = Math.floor(v * p.velocity_coeff);
    var d = p.duration

    //log({
    //  i: i,
    //  n: n,
    //  v: v,
    //  d: d,
    //});

    outlet(OUTLET_JSUI, ["flash"].concat(i.toString()));
    outlet(OUTLET_DURATION, d);
    outlet(OUTLET_VELOCITY, v);
    outlet(OUTLET_NOTE, n);
  }
}

function msg_int(value: number) {
  // integer value received
  handleMessage(value);
}
function msg_float(value: number) {
  // float value received
  handleMessage(value);
}

// called by msg_* methods above when any input is received, e.g. when a knob value changes
function handleMessage(value: number) {
  // 'inlet' is set by M4L and corresponds to the inlet number the last message
  // was received on.
  options[inlet] = value;

  // The first two inlets are INLET_NOTE and INLET_VELOCITY, so we do not need to recalculate
  // the pattern when a message is received on one of those ... only for higher numbered inlets.
  if (inlet > INLET_VELOCITY) {
    setupPattern();
  }

  if (inlet === INLET_NOTE && options[INLET_VELOCITY] > 0) {
    // note received
    for (var idx = 0; idx < pattern.length; idx++) {
      // Schedule a note-playing task to execute for each element in the
      // pattern, at time_offset in the future.
      // The first element is time_offset === 0.
      var t = new Task(makeTask(idx, pattern[idx], options[INLET_NOTE], options[INLET_VELOCITY]));
      t.schedule(pattern[idx].time_offset);
    }
  }
}
