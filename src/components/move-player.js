AFRAME.registerComponent('move-player', {
    init: function () {
        // Access to system
        this.game = document.querySelector('a-scene').systems['game'];
        var scene 	  = document.querySelector("a-scene");
    },
    tick: function(time, timeDelta){
        if(this.checkPacman() === true){
            go = false;
            gameFinish = true;
        }
        if(this.checkPacman() === true && storeScore === true){
            storeScore = false;

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
