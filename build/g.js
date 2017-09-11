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
