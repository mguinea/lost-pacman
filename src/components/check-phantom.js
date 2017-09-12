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
