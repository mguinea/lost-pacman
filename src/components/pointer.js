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
