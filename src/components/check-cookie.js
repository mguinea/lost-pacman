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
