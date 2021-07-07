inlets=9
outlets=4

// inlets
var INLET_NOTE = 0;
var INLET_VELOCITY = 1;
var INLET_TIME_BASE = 2;
var INLET_SEED = 3;
var INLET_ITERATIONS = 4;
var INLET_DUR_BASE = 5
var INLET_DUR_DECAY = 6;
var INLET_NOTE_INCR = 7;
var INLET_VELOCITY_DECAY = 8;

// outlets
var OUTLET_NOTE = 0;
var OUTLET_VELOCITY = 1;
var OUTLET_DURATION = 2;
var OUTLET_JSUI = 3;

var pattern = [];

var options = [
  0,     // INLET_NOTE
  0,     // INLET_VELOCITY
  300,   // INLET_TIME_BASE
  1,     // INLET_SEED
  4,     // INLET_ITERATIONS
  250,   // INLET_DUR_BASE
  0.667, // INLET_DUR_DECAY
  0,     // INLET_NOTE_INCR
  0.8    // INLET_VELOCITY_DECAY
];

setupPattern();

function setupPattern() {
  //log(options);
  pattern = [];
  var b = options[INLET_SEED];
  var a = b;
  var fib = a;

  for (var i = 0; i <= options[INLET_ITERATIONS]; i++) {
    //log(fib);
    pattern.push({
      note_incr: i * options[INLET_NOTE_INCR],
      velocity_coeff: Math.pow(options[INLET_VELOCITY_DECAY], i),
      duration: options[INLET_DUR_BASE] * Math.pow(options[INLET_DUR_DECAY], i),
      time_offset: options[INLET_TIME_BASE] * (fib - 1)
    });
    fib = a;
    a = a + b;
    b = fib;
  }
  //var output = "foo " + JSON.stringify(pattern);
  var output = pattern;
  // calls 'junk' method and gives the rest of the array as js args
  output.unshift('junk');
  //log(output);
  outlet(OUTLET_JSUI, output);
}

function makeTask(i, p, n, v) {
  return function() {
    n = n + p.note_incr;
    v = parseInt(v * p.velocity_coeff);
    var d = p.duration

    //log({
    //  i: i,
    //  n: n,
    //  v: v,
    //  d: d,
    //});

    outlet(OUTLET_DURATION, d);
    outlet(OUTLET_VELOCITY, v);
    outlet(OUTLET_NOTE, n);
  }
}

function msg_int(i) {
  handleMessage(i);
}
function msg_float(i) {
  handleMessage(i);
}

function handleMessage(i) {
  options[inlet] = i;

  if (inlet > INLET_VELOCITY) {
    setupPattern();
  }

  if (inlet === INLET_NOTE && options[INLET_VELOCITY] > 0) {
    for (var idx = 0; idx < pattern.length; idx++) {
      var t = new Task( makeTask(idx, pattern[idx], options[INLET_NOTE], options[INLET_VELOCITY]) );
      t.schedule(pattern[idx].time_offset);
    }
  }
}

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
