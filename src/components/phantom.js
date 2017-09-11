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
