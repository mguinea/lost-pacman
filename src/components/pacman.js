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
