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
