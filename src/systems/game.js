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
