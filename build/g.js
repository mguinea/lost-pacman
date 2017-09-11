function random(){
    return Math.random();
}
/**
 * SfxrParams
 *
 * Copyright 2010 Thomas Vian
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Thomas Vian
 */

 /* eslint-disable */

/** @constructor */
function SfxrParams() {
  //--------------------------------------------------------------------------
  //
  //  Settings String Methods
  //
  //--------------------------------------------------------------------------

  /**
   * Parses a settings array into the parameters
   * @param array Array of the settings values, where elements 0 - 23 are
   *                a: waveType
   *                b: attackTime
   *                c: sustainTime
   *                d: sustainPunch
   *                e: decayTime
   *                f: startFrequency
   *                g: minFrequency
   *                h: slide
   *                i: deltaSlide
   *                j: vibratoDepth
   *                k: vibratoSpeed
   *                l: changeAmount
   *                m: changeSpeed
   *                n: squareDuty
   *                o: dutySweep
   *                p: repeatSpeed
   *                q: phaserOffset
   *                r: phaserSweep
   *                s: lpFilterCutoff
   *                t: lpFilterCutoffSweep
   *                u: lpFilterResonance
   *                v: hpFilterCutoff
   *                w: hpFilterCutoffSweep
   *                x: masterVolume
   * @return If the string successfully parsed
   */
  this.ss = function(values)
  {
    for ( var i = 0; i < 24; i++ )
    {
      this[String.fromCharCode( 97 + i )] = values[i] || 0;
    }

    // I moved this here from the r(true) function
    if (this['c'] < .01) {
      this['c'] = .01;
    }

    var totalTime = this['b'] + this['c'] + this['e'];
    if (totalTime < .18) {
      var multiplier = .18 / totalTime;
      this['b']  *= multiplier;
      this['c'] *= multiplier;
      this['e']   *= multiplier;
    }
  }
}

/**
 * SfxrSynth
 *
 * Copyright 2010 Thomas Vian
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Thomas Vian
 */
/** @constructor */
function SfxrSynth() {
  // All variables are kept alive through function closures

  //--------------------------------------------------------------------------
  //
  //  Sound Parameters
  //
  //--------------------------------------------------------------------------

  this._p = new SfxrParams();  // Params instance

  //--------------------------------------------------------------------------
  //
  //  Synth Variables
  //
  //--------------------------------------------------------------------------

  var _envelopeLength0, // Length of the attack stage
      _envelopeLength1, // Length of the sustain stage
      _envelopeLength2, // Length of the decay stage

      _period,          // Period of the wave
      _maxPeriod,       // Maximum period before sound stops (from minFrequency)

      _slide,           // Note slide
      _deltaSlide,      // Change in slide

      _changeAmount,    // Amount to change the note by
      _changeTime,      // Counter for the note change
      _changeLimit,     // Once the time reaches this limit, the note changes

      _squareDuty,      // Offset of center switching point in the square wave
      _dutySweep;       // Amount to change the duty by

  //--------------------------------------------------------------------------
  //
  //  Synth Methods
  //
  //--------------------------------------------------------------------------

  /**
   * rs the runing variables from the params
   * Used once at the start (total r) and for the repeat effect (partial r)
   */
  this.r = function() {
    // Shorter reference
    var p = this._p;

    _period       = 100 / (p['f'] * p['f'] + .001);
    _maxPeriod    = 100 / (p['g']   * p['g']   + .001);

    _slide        = 1 - p['h'] * p['h'] * p['h'] * .01;
    _deltaSlide   = -p['i'] * p['i'] * p['i'] * .000001;

    if (!p['a']) {
      _squareDuty = .5 - p['n'] / 2;
      _dutySweep  = -p['o'] * .00005;
    }

    _changeAmount =  1 + p['l'] * p['l'] * (p['l'] > 0 ? -.9 : 10);
    _changeTime   = 0;
    _changeLimit  = p['m'] == 1 ? 0 : (1 - p['m']) * (1 - p['m']) * 20000 + 32;
  }

  // I split the r() function into two functions for better readability
  this.tr = function() {
    this.r();

    // Shorter reference
    var p = this._p;

    // Calculating the length is all that remained here, everything else moved somewhere
    _envelopeLength0 = p['b']  * p['b']  * 100000;
    _envelopeLength1 = p['c'] * p['c'] * 100000;
    _envelopeLength2 = p['e']   * p['e']   * 100000 + 12;
    // Full length of the volume envelop (and therefore sound)
    // Make sure the length can be divided by 3 so we will not need the padding "==" after base64 encode
    return ((_envelopeLength0 + _envelopeLength1 + _envelopeLength2) / 3 | 0) * 3;
  }

  /**
   * Writes the wave to the supplied buffer ByteArray
   * @param buffer A ByteArray to write the wave to
   * @return If the wave is finished
   */
  this.sw = function(buffer, length) {
    // Shorter reference
    var p = this._p;

    // If the filters are active
    var _filters = p['s'] != 1 || p['v'],
        // Cutoff multiplier which adjusts the amount the wave position can move
        _hpFilterCutoff = p['v'] * p['v'] * .1,
        // Speed of the high-pass cutoff multiplier
        _hpFilterDeltaCutoff = 1 + p['w'] * .0003,
        // Cutoff multiplier which adjusts the amount the wave position can move
        _lpFilterCutoff = p['s'] * p['s'] * p['s'] * .1,
        // Speed of the low-pass cutoff multiplier
        _lpFilterDeltaCutoff = 1 + p['t'] * .0001,
        // If the low pass filter is active
        _lpFilterOn = p['s'] != 1,
        // masterVolume * masterVolume (for quick calculations)
        _masterVolume = p['x'] * p['x'],
        // Minimum frequency before stopping
        _minFreqency = p['g'],
        // If the phaser is active
        _phaser = p['q'] || p['r'],
        // Change in phase offset
        _phaserDeltaOffset = p['r'] * p['r'] * p['r'] * .2,
        // Phase offset for phaser effect
        _phaserOffset = p['q'] * p['q'] * (p['q'] < 0 ? -1020 : 1020),
        // Once the time reaches this limit, some of the    iables are r
        _repeatLimit = p['p'] ? ((1 - p['p']) * (1 - p['p']) * 20000 | 0) + 32 : 0,
        // The punch factor (louder at begining of sustain)
        _sustainPunch = p['d'],
        // Amount to change the period of the wave by at the peak of the vibrato wave
        _vibratoAmplitude = p['j'] / 2,
        // Speed at which the vibrato phase moves
        _vibratoSpeed = p['k'] * p['k'] * .01,
        // The type of wave to generate
        _waveType = p['a'];

    var _envelopeLength      = _envelopeLength0,     // Length of the current envelope stage
        _envelopeOverLength0 = 1 / _envelopeLength0, // (for quick calculations)
        _envelopeOverLength1 = 1 / _envelopeLength1, // (for quick calculations)
        _envelopeOverLength2 = 1 / _envelopeLength2; // (for quick calculations)

    // Damping muliplier which restricts how fast the wave position can move
    var _lpFilterDamping = 5 / (1 + p['u'] * p['u'] * 20) * (.01 + _lpFilterCutoff);
    if (_lpFilterDamping > .8) {
      _lpFilterDamping = .8;
    }
    _lpFilterDamping = 1 - _lpFilterDamping;

    var _finished = false,     // If the sound has finished
        _envelopeStage    = 0, // Current stage of the envelope (attack, sustain, decay, end)
        _envelopeTime     = 0, // Current time through current enelope stage
        _envelopeVolume   = 0, // Current volume of the envelope
        _hpFilterPos      = 0, // Adjusted wave position after high-pass filter
        _lpFilterDeltaPos = 0, // Change in low-pass wave position, as allowed by the cutoff and damping
        _lpFilterOldPos,       // Previous low-pass wave position
        _lpFilterPos      = 0, // Adjusted wave position after low-pass filter
        _periodTemp,           // Period modified by vibrato
        _phase            = 0, // Phase through the wave
        _phaserInt,            // Integer phaser offset, for bit maths
        _phaserPos        = 0, // Position through the phaser buffer
        _pos,                  // Phase expresed as a Number from 0-1, used for fast sin approx
        _repeatTime       = 0, // Counter for the repeats
        _sample,               // Sub-sample calculated 8 times per actual sample, averaged out to get the super sample
        _superSample,          // Actual sample writen to the wave
        _vibratoPhase     = 0; // Phase through the vibrato sine wave

    // Buffer of wave values used to create the out of phase second wave
    var _phaserBuffer = new Array(1024),
        // Buffer of random values used to generate noise
        _noiseBuffer  = new Array(32);
    for (var i = _phaserBuffer.length; i--; ) {
      _phaserBuffer[i] = 0;
    }
    for (var i = _noiseBuffer.length; i--; ) {
      _noiseBuffer[i] = random(2,-1);
    }

    for (var i = 0; i < length; i++) {
      if (_finished) {
        return i;
      }

      // Repeats every _repeatLimit times, partially rting the sound parameters
      if (_repeatLimit) {
        if (++_repeatTime >= _repeatLimit) {
          _repeatTime = 0;
          this.r();
        }
      }

      // If _changeLimit is reached, shifts the pitch
      if (_changeLimit) {
        if (++_changeTime >= _changeLimit) {
          _changeLimit = 0;
          _period *= _changeAmount;
        }
      }

      // Acccelerate and apply slide
      _slide += _deltaSlide;
      _period *= _slide;

      // Checks for frequency getting too low, and stops the sound if a minFrequency was set
      if (_period > _maxPeriod) {
        _period = _maxPeriod;
        if (_minFreqency > 0) {
          _finished = true;
        }
      }

      _periodTemp = _period;

      // Applies the vibrato effect
      if (_vibratoAmplitude > 0) {
        _vibratoPhase += _vibratoSpeed;
        _periodTemp *= 1 + Math.sin(_vibratoPhase) * _vibratoAmplitude;
      }

      _periodTemp |= 0;
      if (_periodTemp < 8) {
        _periodTemp = 8;
      }

      // Sweeps the square duty
      if (!_waveType) {
        _squareDuty += _dutySweep;
        if (_squareDuty < 0) {
          _squareDuty = 0;
        } else if (_squareDuty > .5) {
          _squareDuty = .5;
        }
      }

      // Moves through the different stages of the volume envelope
      if (++_envelopeTime > _envelopeLength) {
        _envelopeTime = 0;

        switch (++_envelopeStage)  {
          case 1:
            _envelopeLength = _envelopeLength1;
            break;
          case 2:
            _envelopeLength = _envelopeLength2;
        }
      }

      // Sets the volume based on the position in the envelope
      switch (_envelopeStage) {
        case 0:
          _envelopeVolume = _envelopeTime * _envelopeOverLength0;
          break;
        case 1:
          _envelopeVolume = 1 + (1 - _envelopeTime * _envelopeOverLength1) * 2 * _sustainPunch;
          break;
        case 2:
          _envelopeVolume = 1 - _envelopeTime * _envelopeOverLength2;
          break;
        case 3:
          _envelopeVolume = 0;
          _finished = true;
      }

      // Moves the phaser offset
      if (_phaser) {
        _phaserOffset += _phaserDeltaOffset;
        _phaserInt = _phaserOffset | 0;
        if (_phaserInt < 0) {
          _phaserInt = -_phaserInt;
        } else if (_phaserInt > 1023) {
          _phaserInt = 1023;
        }
      }

      // Moves the high-pass filter cutoff
      if (_filters && _hpFilterDeltaCutoff) {
        _hpFilterCutoff *= _hpFilterDeltaCutoff;
        if (_hpFilterCutoff < .00001) {
          _hpFilterCutoff = .00001;
        } else if (_hpFilterCutoff > .1) {
          _hpFilterCutoff = .1;
        }
      }

      _superSample = 0;
      for (var j = 8; j--; ) {
        // Cycles through the period
        _phase++;
        if (_phase >= _periodTemp) {
          _phase %= _periodTemp;

          // Generates new random noise for this period
          if (_waveType == 3) {
            for (var n = _noiseBuffer.length; n--; ) {
              _noiseBuffer[n] = random(2,-1);
            }
          }
        }

        // Gets the sample from the oscillator
        switch (_waveType) {
          case 0: // Square wave
            _sample = ((_phase / _periodTemp) < _squareDuty) ? .5 : -.5;
            break;
          case 1: // Saw wave
            _sample = 1 - _phase / _periodTemp * 2;
            break;
          case 2: // Sine wave (fast and accurate approx)
            _pos = _phase / _periodTemp;
            _pos = (_pos > .5 ? _pos - 1 : _pos) * 6.28318531;
            _sample = 1.27323954 * _pos + .405284735 * _pos * _pos * (_pos < 0 ? 1 : -1);
            _sample = .225 * ((_sample < 0 ? -1 : 1) * _sample * _sample  - _sample) + _sample;
            break;
          case 3: // Noise
            _sample = _noiseBuffer[Math.abs(_phase * 32 / _periodTemp | 0)];
        }

        // Applies the low and high pass filters
        if (_filters) {
          _lpFilterOldPos = _lpFilterPos;
          _lpFilterCutoff *= _lpFilterDeltaCutoff;
          if (_lpFilterCutoff < 0) {
            _lpFilterCutoff = 0;
          } else if (_lpFilterCutoff > .1) {
            _lpFilterCutoff = .1;
          }

          if (_lpFilterOn) {
            _lpFilterDeltaPos += (_sample - _lpFilterPos) * _lpFilterCutoff;
            _lpFilterDeltaPos *= _lpFilterDamping;
          } else {
            _lpFilterPos = _sample;
            _lpFilterDeltaPos = 0;
          }

          _lpFilterPos += _lpFilterDeltaPos;

          _hpFilterPos += _lpFilterPos - _lpFilterOldPos;
          _hpFilterPos *= 1 - _hpFilterCutoff;
          _sample = _hpFilterPos;
        }

        // Applies the phaser effect
        if (_phaser) {
          _phaserBuffer[_phaserPos % 1024] = _sample;
          _sample += _phaserBuffer[(_phaserPos - _phaserInt + 1024) % 1024];
          _phaserPos++;
        }

        _superSample += _sample;
      }

      // Averages out the super samples and applies volumes
      _superSample *= .125 * _envelopeVolume * _masterVolume;

      // Clipping if too loud
      buffer[i] = _superSample >= 1 ? 32767 : _superSample <= -1 ? -32768 : _superSample * 32767 | 0;
    }

    return length;
  }
}

// Adapted from http://codebase.es/riffwave/
var synth = new SfxrSynth();
// Export for the Closure Compiler
function jsfxr (settings, audioCtx, cb) {
  // Initialize SfxrParams
  synth._p.ss(settings);
  // Synthesize Wave
  var envelopeFullLength = synth.tr();
  var data = new Uint8Array(((envelopeFullLength + 1) / 2 | 0) * 4 + 44);

  var used = synth.sw(new Uint16Array(data.buffer, 44), envelopeFullLength) * 2;

  var dv = new Uint32Array(data.buffer, 0, 44);
  // Initialize header
  dv[0] = 0x46464952; // "RIFF"
  dv[1] = used + 36;  // put total size here
  dv[2] = 0x45564157; // "WAVE"
  dv[3] = 0x20746D66; // "fmt "
  dv[4] = 0x00000010; // size of the following
  dv[5] = 0x00010001; // Mono: 1 channel, PCM format
  dv[6] = 0x0000AC44; // 44,100 samples per second
  dv[7] = 0x00015888; // byte rate: two bytes per sample
  dv[8] = 0x00100002; // 16 bits per sample, aligned on every two bytes
  dv[9] = 0x61746164; // "data"
  dv[10] = used;      // put number of samples here

  // Base64 encoding written by me, @maettig
  used += 44;
  var i = 0,
      base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      output = 'data:audio/wav;base64,';
  for (; i < used; i += 3)
  {
    var a = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
    output += base64Characters[a >> 18] + base64Characters[a >> 12 & 63] + base64Characters[a >> 6 & 63] + base64Characters[a & 63];
  }

  audioCtx && audioCtx.decodeAudioData(data.buffer, cb);

  return output;
}

var audioCtx, audioDest, audio, play;

var AudioContext = window.AudioContext || window.webkitAudioContext;

if (AudioContext) {
  audioCtx = new AudioContext();
  audioDest = audioCtx.createDynamicsCompressor();
  var gain = audioCtx.createGain();
  gain.gain.value = 1.0;
  audioDest.connect(gain);
  gain.connect(audioCtx.destination);

  audio = function (conf) { // eslint-disable-line no-unused-vars
    var o = [];
    jsfxr(conf, audioCtx, function (buf) {
      o.push(buf);
    });
    return o;
  };
  play = function (o) { // eslint-disable-line no-unused-vars
    if (!o[0]) return;
    var source = audioCtx.createBufferSource();
    source.buffer = o[0];
    source.start(0);
    source.connect(audioDest);
    setTimeout(function () {
      source.disconnect(audioDest);
    }, o[0].duration * 1000 + 300);
  };
}
else {
  audio = play = function(){};
}

var ACookie = audio([0,,0.0871,0.4268,0.1343,0.4023,,,,,,0.5808,0.6415,,,,,,1,,,,,0.5]),
	AGameOver	= audio([3,0.1514,0.6943,0.0058,0.3098,0.2826,,-0.3168,0.0069,-0.0025,-0.7927,-0.0967,0.5125,,-0.6956,,0.9598,-0.814,0.2006,-0.2304,-0.6659,,0.422,0.5]);

var colors = [
	'#f00',
	'#00f',
	'#fff',
	'#000',
	'#f1c40f',
	'#3498db',
	'#C15AAD'
];

function aabbCollides(e1, e2){
	return(
			e1.x - (e1.width / 2) 				< e2.x - (e2.width / 2)   +   e2.width  &&
			e1.x - (e1.width / 2) + e1.width  	> e2.x - (e2.width / 2)     			&&
			e1.z - (e1.depth / 2)  				< e2.z - (e2.depth / 2)  +   e2.depth  	&&
			e1.z - (e1.depth / 2) + e1.depth  	> e2.z - (e2.depth / 2));
}

function clone(obj) {
	var copy;

	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj! Its type isn't supported.");
}

function addTriangle (vA, vB, vC, r, pos, c, entityToAttach){
	var scene 	= document.querySelector('a-scene'),
		el 		= document.createElement('a-entity');
	el.setAttribute('geometry', {
		primitive: 'triangle',
		vertexA: AFRAME.utils.coordinates.stringify(vA),
		vertexB: AFRAME.utils.coordinates.stringify(vB),
		vertexC: AFRAME.utils.coordinates.stringify(vC),
	});
	el.setAttribute('position', {x : pos.x, y : pos.y, z : pos.z});
	el.setAttribute('rotation', {x : 0, y : r, z : 0});
	el.setAttribute('material', {color:c});
	entityToAttach.appendChild(el);
}

function addPlane(w, h, r, pos, c, s, entityToAttach){
	addTriangle ({x:0,y:0,z:0}, {x:0,y:h*s,z:0}, {x:w*s,y:0,z:0}, r, pos, c, entityToAttach);
	addTriangle ({x:w*s,y:0,z:0}, {x:0,y:h*s,z:0}, {x:w*s,y:h*s,z:0}, r, pos, c, entityToAttach);
}

function angleTo ( e1, e2 ) {
    return Math.atan2(
        (e2.x) - (e1.x),
        (e2.z) - (e1.z)
    );
}

AFRAME.registerComponent('pacman', {
    init: function () {
    },
    tick: function(time, timeDelta){
		if(go === false){
			this.el.setAttribute('visible', false);
		}else{
			this.el.setAttribute('visible', true);
		}
		var player 	  = document.querySelector('.player');
		var playerPosition = player.getAttribute('position');
		var angle = angleTo(this.el.object3D.position, playerPosition);
		this.el.object3D.rotation.y = angle;
	}
});

AFRAME.registerComponent('phantom', {
	schema: {
		color: { type: 'string', default: '#f00'}
	},
	init: function () {
		this.game = document.querySelector('a-scene').systems['game'];
		var data 	= this.data;
		var el 		= this.el;
		var scale	= 0.05;
		var p 		= el.getAttribute('position');
		var xOffset = -0.25;
		this.direction = 2;
		var color = this.data.color;
		// w, h, r, pos, c, s

		// Front face
		addPlane(1, 8, 180, {x:xOffset+0,y:0,z:0}, color, scale, el);
		addPlane(1, 10, 180,{x:xOffset+0.05,y:0.05,z:0}, color, scale, el);
		addPlane(1, 10, 180,{x:xOffset+0.1,y:0.1,z:0}, color, scale, el);
		addPlane(1, 12, 180,{x:xOffset+0.15,y:0.05,z:0}, color, scale, el);
		addPlane(1, 14, 180,{x:xOffset+0.2,y:0,z:0}, color, scale, el);

		addPlane(1, 12, 180,{x:xOffset+0.25,y:0.1,z:0}, color, scale, el);
		addPlane(1, 12, 180,{x:xOffset+0.3,y:0.1,z:0}, color, scale, el);

		addPlane(1, 14, 180,{x:xOffset+0.35,y:0,z:0}, color, scale, el);
		addPlane(1, 12, 180,{x:xOffset+0.40,y:0.05,z:0}, color, scale, el);
		addPlane(1, 10, 180,{x:xOffset+0.45,y:0.1,z:0}, color, scale, el);
		addPlane(1, 10, 180,{x:xOffset+0.50,y:0.05,z:0}, color, scale, el);
		addPlane(1, 8, 180, {x:xOffset+0.55,y:0,z:0}, color, scale, el);
		// Eyes
		addPlane(4, 3, 180, {x:xOffset+0.2,y:0.35,z:0.01}, colors[2], scale, el);
		addPlane(2, 5, 180, {x:xOffset+0.15,y:0.3,z:0.01}, colors[2], scale, el);
		addPlane(2, 2, 180, {x:xOffset+0.1,y:0.35,z:0.02}, colors[3], scale, el);

		addPlane(4, 3, 180, {x:xOffset+0.5,y:0.35,z:0.01}, colors[2], scale, el);
		addPlane(2, 5, 180, {x:xOffset+0.45,y:0.3,z:0.01}, colors[2], scale, el);
		addPlane(2, 2, 180, {x:xOffset+0.4,y:0.35,z:0.02}, colors[3], scale, el);

		// Borders
		// addPlane(1, 8, -270, {x:xOffset+0-0.05,y:0,z:0}, colors[2], scale, el);
	},

	tick: function (t, timeDelta) {
		var oldPosition     = clone(this.el.object3D.position);
		var currentPosition = this.el.object3D.position;
		var vel 			= 0.7 * timeDelta / 1000;
		// Look to player
		this.lookToPlayer();
		// Sin
		var amplitude = 0.005,
			frequency = 0.005,
			phase		= 0.1;

		this.el.setAttribute('position', {
			x: currentPosition.x,
			y: currentPosition.y += amplitude * Math.sin(frequency * t + phase),
			z: currentPosition.z
		});
		// Move
		if(!go) return;
		// 0 UP 1 DOWN 2 LEFT 3 RIGHT
		switch(this.direction){
			case 0:
		        this.el.setAttribute('position', {
		            x: currentPosition.x,
		            y: currentPosition.y,
		            z: currentPosition.z + vel
		        });
			break;
			case 1:
		        this.el.setAttribute('position', {
		            x: currentPosition.x,
		            y: currentPosition.y,
		            z: currentPosition.z - vel
		        });
			break;
			case 2:
		        this.el.setAttribute('position', {
		            x: currentPosition.x - vel,
		            y: currentPosition.y,
		            z: currentPosition.z
		        });
			break;
			case 3:
		        this.el.setAttribute('position', {
		            x: currentPosition.x + vel,
		            y: currentPosition.y,
		            z: currentPosition.z
		        });
			break;
		}

		var collidingWall = this.checkWalls();
		if(collidingWall == true){

			this.el.setAttribute('position', {
                x: oldPosition.x,
                y: oldPosition.y,
                z: oldPosition.z
            });
			// Change direction
			this.direction = ~~(Math.random() * (3 - 0) + 0);
		}
	},

	lookToPlayer : function(){
		var player 	  = document.querySelector('.player');
		var playerPosition = player.getAttribute('position');
		var angle = angleTo(this.el.object3D.position, playerPosition);
		this.el.object3D.rotation.y = angle;
	},

	checkWalls : function(){
		var el 		= this.el;
		var myPos = el.getAttribute("position");
        var rows = this.game.map.length;
        var cols = this.game.map[0].length;

        var phantom = {};
        phantom.x = myPos.x;
        phantom.z = myPos.z;
        phantom.width = 0.9;
        phantom.depth = 0.9;

        for(var x = 0; x < cols; ++x){
            for(var z = 0; z < rows; ++z){
                if(this.game.map[z][x] === 1){
                    var wall = {};
                    wall.x = x;
                    wall.z = z;
                    wall.width = 1;
                    wall.depth = 1;

                    if(aabbCollides(wall, phantom)){
                        return true;
                    }
                }
            }
		}
        return false;
    }
});

AFRAME.registerComponent('pointer', {
	init: function () {
	},
	tick : function(t, dt){
		var entity = this.el;

		if(countDown === true || gameOver == true){
			entity.setAttribute("visible", false);
		}else{
			entity.setAttribute("visible", true);
		}
	}
});

AFRAME.registerComponent('user-interface', {
	init: function () {
	},
	tick : function(t, dt){
		var entity = this.el;
		if(gameOver === true){
			entity.setAttribute("visible", false);
		}
		if(gameFinish === true){
			entity.setAttribute("visible", false);
		}
		entity.setAttribute("text", {value: "Score: " + score});
	}
});

AFRAME.registerComponent('game-state-interface', {
	init: function () {
	},
	tick : function(t, dt){
		var entity = this.el;
		var text = "";

		if(retry === true){
			retry = false;
			countDownTimer = 7;
		}

		if(countDown === true){
			if(countDownTimer > 5){
				text = "Ready?\r\n" + ~~(countDownTimer);
			}else if(countDownTimer > 3){
				text = "Steady?\r\n" + ~~(countDownTimer);
			}
			else if(countDownTimer > 0.1){
				text = "Go!\r\n" + ~~(countDownTimer);
			}
			entity.setAttribute("text", {value: text});
		}else if(gameOver === true){
			var bestScore = (scores[0] < score) ? score : scores[0];
			text = "Game Over";

			entity.setAttribute("text", {value: text});
		}else if(gameFinish === true){
			scores.sort();
			scores.reverse();
			var bestScore = (scores[0] < score) ? score : scores[0];
			
			text = "Congratulations!\r\n Your score: " + score + "\r\nBest score: " + bestScore;
			// Show new record message
			if(scores[0] < score){
				text += "\r\nNEW RECORD!!!";
			}
			entity.setAttribute("text", {value: text});
		}
	}
});

AFRAME.registerComponent('check-cookie', {
	init: function () {
		var scene 	= document.querySelector("a-scene");
		this.cookies = scene.querySelectorAll('.cookie');
	},

	tick: function (t, timeDelta) {
		var currentPosition = this.el.object3D.position,
			player = {};
		player.x = currentPosition.x;
		player.z = currentPosition.z;
		player.width = 1;
		player.depth = 1;

		for(var i = this.cookies.length - 1; i >= 0; --i){
			var cookie = {};
			cookie.x 		= this.cookies[i].getAttribute('position').x;
			cookie.z 		= this.cookies[i].getAttribute('position').z;
			cookie.width 	= 0.5;
			cookie.depth 	= 0.5;
			cookie.visible	= this.cookies[i].getAttribute('visible');
			if(aabbCollides(cookie, player) && cookie.visible === true){
				++score;
				this.cookies[i].setAttribute('visible', false);
				if(score > 0){
					play(ACookie);
				}
			}
		}
	}
});

AFRAME.registerComponent('check-phantom', {
    init: function () {
        // Access to system
        // this.game = document.querySelector('a-scene').systems['game'];
        //var scene 	  = document.querySelector("a-scene");
    },
    tick: function(time, timeDelta){
        var currentPosition 	= this.el.object3D.position;
        var collidingPhantom 	= this.checkPhantoms();
        if(collidingPhantom == true && storeScore === true){
            go           = false;
			gameOver     = true;
            storeScore   = false;

            // Store score
            /*
            scoreStored = JSON.parse(localStorage.getItem(localStorageId));
            scoreStored.push(score);
            localStorage.removeItem(localStorageId);
            localStorage.setItem(localStorageId, JSON.stringify(scoreStored));
            //*/
        }
    },

    checkPhantoms : function(){
		var scene = document.querySelector("a-scene");
        var camera = scene.querySelector("#camera");
		var myPos = camera.getAttribute("position");

        var player = {};
        player.x = myPos.x;
        player.z = myPos.z;
        player.width = 0.1;
        player.depth = 0.1;

		var phantoms = scene.querySelectorAll('.phantom');

        for(var i = phantoms.length - 1; i>= 0; --i){
			var ppos = phantoms[i].getAttribute('position');
            var phantom = {};
            phantom.x = ppos.x;
            phantom.z = ppos.z;
            phantom.width = 1;
            phantom.depth = 1;

            if(aabbCollides(phantom, player)){
                return true;
            }
		}
        return false;
    }
});

AFRAME.registerComponent('move-player', {
    init: function () {
        // Access to system
        this.game = document.querySelector('a-scene').systems['game'];
        var scene 	  = document.querySelector("a-scene");
    },
    tick: function(time, timeDelta){
        if(this.checkPacman() === true && storeScore === true){
            go = false;
            gameFinish = true;

            // Store score
            scores = JSON.parse(localStorage.getItem(localStorageId));
            scores.push(score);
            localStorage.removeItem(localStorageId);
            localStorage.setItem(localStorageId, JSON.stringify(scores));
        }

        if(go === false) return;
        var oldPosition     = clone(this.el.object3D.position);

        var currentRotation = this.el.object3D.rotation;
        var angle 			= currentRotation.y;
        var currentPosition = this.el.object3D.position;
        var vel = 1.0;
        var px = vel * Math.sin(angle) * timeDelta / 1000;
        var pz = vel * Math.cos(angle) * timeDelta / 1000;



        this.el.setAttribute('position', {
            x: currentPosition.x - px,
            y: currentPosition.y,
            z: currentPosition.z - pz
        });

        var collidingWall = this.checkWalls();
        if(collidingWall == true){
            this.el.setAttribute('position', {
                x: oldPosition.x,
                y: oldPosition.y,
                z: oldPosition.z
            });
        }
    },

    checkPacman : function(){
        var camera = document.querySelector("#camera");
		var myPos = camera.getAttribute("position");
        var player = {};
        player.x = myPos.x;
        player.z = myPos.z;
        player.width = 0.1;
        player.depth = 0.1;

        var pacman = {};
        pacman.x = pacmanPos.x;
        pacman.z = pacmanPos.z;
        pacman.width = 1;
        pacman.depth = 1;
        if(aabbCollides(pacman, player)){
            return true;
        }
        return false;
    },

    checkWalls : function(){
        var camera = document.querySelector("#camera");
		var myPos = camera.getAttribute("position");
        var rows = this.game.map.length;
        var cols = this.game.map[0].length;

        var player = {};
        player.x = myPos.x;
        player.z = myPos.z;
        player.width = 0.1;
        player.depth = 0.1;

        for(var x = 0; x < cols; ++x){
            for(var z = 0; z < rows; ++z){
                if(this.game.map[z][x] === 1){
                    var wall = {};
                    wall.x = x;
                    wall.z = z;
                    wall.width = 1;
                    wall.depth = 1;

                    if(aabbCollides(wall, player)){
                        return true;
                    }
                }
            }
		}
        return false;
    }
});

AFRAME.registerSystem('game', {
    schema: {},  // System schema. Parses into `this.data`.
    init: function () {
        // Load scores
        // localStorage.removeItem(localStorageId);
        scores = localStorage.getItem(localStorageId);
        if(!scores){
            localStorage.setItem(localStorageId, JSON.stringify([]));
        }
        scores = JSON.parse(localStorage.getItem(localStorageId));

        // Map
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
            [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ];

        this.tileSize = 1;
        // Create map
        this.createMap();
        // Instantiate phantoms. Random positions near center
        this.instantiatePhantom(colors[0]);
        this.instantiatePhantom(colors[4]);
        this.instantiatePhantom(colors[5]);
        this.instantiatePhantom(colors[6]);
        // Instantiate pacman target
        this.instantiatePacman();
    },
    tick(t, timeDelta){
        if(gameOver === true && newGameTimer >= 0){
            newGameTimer -= 0.1 * timeDelta / 100;
        }
        if(newGameTimer <= 0){
            // this.resetGame();
            // window.location.reload(true); // Not working properly. It exits from frame size
        }
        if(countDown === true){
            countDownTimer -= 0.1 * timeDelta / 100;
        }
        if(countDownTimer <= 0 && gameOver === false){
            go          = true;
            countDown   = false;
        }
        if(gameOver === true && flagGameOver === false){
            flagGameOver = true;
            play(AGameOver);
        }
    },
    resetGame : function(){
        score			= -1;
        go				= false;
        countDown		= true;
        gameOver		= false;
        retry			= false;
        countDownTimer	= 7;
        newGameTimer	= 3;
        storeScore		= true;
        flagGameOver	= false;
        var player 	  = document.querySelector('.player');
        player.setAttribute('position', {x:1, y:0.5, z:5});
    },
    createMap : function(){
        var cookieCounter = 0;
        var rows = this.map.length;
        var cols = this.map[0].length;

        for(var x = 0; x < cols; ++x){
            for(var z = 0; z < rows; ++z){
                // Borders
                if(z === rows - 1 && this.map[z - 1][x] === 0){
                    this.instantiateWall(x + 0.5, z - 0.5, -180);   // NORTH
                }
                else if(z === 0 && this.map[z + 1][x] === 0){
                    this.instantiateWall(x - 0.5, z + 0.5, 0);      // SOUTH
                }
                else if(x === cols - 1 && this.map[z][x - 1] === 0){
                    this.instantiateWall(x - 0.5, z - 0.5, -90);    // WEST
                }
                else if(x === 0 && this.map[z][x + 1] === 0){
                    this.instantiateWall(x + 0.5, z + 0.5, 90);     // EAST
                }
                // We are not in a border and we need to draw walls
                if(x > 0 && x < cols - 1 && z > 0 && z < rows - 1 && this.map[z][x] == 1){
                    if(this.map[z-1][x] === 0){
                        this.instantiateWall(x + 0.5, z - 0.5, -180);   // NORTH
                    }
                    if(this.map[z+1][x] === 0){
                        this.instantiateWall(x - 0.5, z + 0.5, 0);      // SOUTH
                    }
                    if(this.map[z][x-1] === 0){
                        this.instantiateWall(x - 0.5, z - 0.5, -90);    // WEST
                    }
                    if(this.map[z][x+1] === 0){
                        this.instantiateWall(x + 0.5, z + 0.5, 90);     // EAST
                    }
                }else if(x > 0 && x < cols - 1 && z > 0 && z < rows - 1 && this.map[z][x] == 0){
                    // Cookie
                    this.instantiateCookie(x, z, cookieCounter);
                    ++cookieCounter;
                }
            }
        }
    },
    instantiateWall : function(x, z, r){
        var scene 	  = document.querySelector("a-scene");
        addTriangle({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, {x: 1, y: 1, z: 0}, r, {x : x, y : 0, z : z}, colors[1], scene);
        addTriangle({x: 0, y: 0, z: 0}, {x: 1, y: 1, z: 0}, {x: 0, y: 1, z: 0}, r, {x : x, y : 0, z : z}, colors[1], scene);
    },
    instantiatePhantom : function(color){
        var scene 	= document.querySelector("a-scene");
        var el 		= document.createElement('a-entity');
        //*
        /*el.setAttribute(
            'geometry', {
                primitive: 'box',
                height: 0.25,
                width: 0.25,
                depth: 0.25
            }
        );*/

        // Search free position
        var freePos = this.getFreePosition();
        el.setAttribute('position', {x: freePos.x, y: 0.2, z: freePos.z});
        console.log("Phantom in x: " + freePos.x + " z: " + freePos.z);
        //*/
        /*
        el.setAttribute('width', 1);
        el.setAttribute('height', 1);
        el.setAttribute('depth', 1);
        el.setAttribute('material', {color:'#f00', src: 'url(media/texture.png)'});
        el.setAttribute('transparent', true);
        //*/
        el.setAttribute('phantom', {color : color});
        el.className = 'phantom';
        scene.appendChild(el);
    },
    getFreePosition : function(){
        var rows = this.map.length;
        var cols = this.map[0].length;
        var targetX = 0;
        var targetZ = 0;

        for(var i = 0; i < 100; ++i){
            targetX = ~~(Math.random() * ((cols - 1) - 1) + 1);
            targetZ = ~~(Math.random() * ((rows - 1) - 1) + 1);

            if(this.map[targetZ][targetX] === 0){
                return {x: targetX, z: targetZ};
            }
        }
    },
    instantiateCookie : function(x, z, id){
        var scene 	= document.querySelector("a-scene");
        var el 		= document.createElement('a-entity');
        el.setAttribute('geometry', {
            primitive: 'sphere',
            radius : 0.1
            /*height: 0.1,
            width: 0.1,
            depth: 0.1*/
        });
        el.setAttribute('position', {x: x, y: 0.25, z: z});
        /*el.setAttribute('width', 0.1);
        el.setAttribute('height', 0.1);
        el.setAttribute('depth', 0.1);*/
        el.setAttribute('material', {color:'#fff'});
        el.setAttribute('visible', true);
        el.className = 'cookie';
        scene.appendChild(el);
    },
    instantiatePacman : function(){
        var scene 	= document.querySelector("a-scene");
        var el 		= document.createElement('a-entity');

        var freePos = this.getFreePosition();
        el.setAttribute('position', {x: freePos.x, y: 0.05, z: freePos.z});
        pacmanPos.x = freePos.x;
        pacmanPos.z = freePos.z;

        console.log("Pacman in x: " + freePos.x + " z: " + freePos.z);

        // Body
        var body    = document.createElement('a-entity');
        body.setAttribute('geometry', {
            primitive: 'sphere',
            radius : 0.4
        });
        body.setAttribute('position', {x: 0, y: 0.4, z: 0});
        body.setAttribute('material', {color:colors[4]});
        body.setAttribute('visible', true);
        el.appendChild(body);
        // Eyes
        var e1    = document.createElement('a-entity');
        e1.setAttribute('geometry', {
            primitive: 'sphere',
            radius : 0.1
        });
        e1.setAttribute('position', {x: 0-0.15, y: 0.5, z: 0+0.35});
        e1.setAttribute('material', {color:colors[3]});
        e1.setAttribute('visible', true);
        el.appendChild(e1);

        var e2    = document.createElement('a-entity');
        e2.setAttribute('geometry', {
            primitive: 'sphere',
            radius : 0.1
        });
        e2.setAttribute('position', {x: 0+0.15, y: 0.5, z: 0+0.35});
        e2.setAttribute('material', {color:colors[3]});
        e2.setAttribute('visible', true);
        el.appendChild(e2);
        // Mouth
        var mouth    = document.createElement('a-entity');
        mouth.setAttribute('geometry', {
            primitive: 'torus',
            arc : 360,
            radius: 0.28,
            radiusTubular: 0.04,

        });
        mouth.setAttribute('position', {x: 0, y: 0.3, z: 0 + 0.06});
        mouth.setAttribute('rotation', {x: -90, y: 0, z: 0});
        mouth.setAttribute('material', {color:colors[3]});
        mouth.setAttribute('visible', true);
        mouth.setAttribute('theta-start', 45);
        el.appendChild(mouth);

        // Append to scene
        el.className = 'pacman';

        el.setAttribute('pacman', '');
        scene.appendChild(el);
    }
});