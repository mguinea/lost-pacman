AFRAME.registerComponent('collider-check-wall', {
    dependencies: ['raycaster'],
    init: function () {
        this.el.addEventListener('raycaster-intersected', function () {
            collidingWall = true;
        });

        this.el.addEventListener('raycaster-intersection', function () {
            collidingWall = true;
        });

        this.el.addEventListener('raycaster-intersected-cleared', function () {
            collidingWall = false;
        });

        this.el.addEventListener('raycaster-intersection-cleared', function () {
            collidingWall = false;
        });
    },
    tick : function(t, dt){
        /*var intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
           var firstIntersectedObject  = intersects[0];
           // this will give you the first intersected Object if there are multiple.
       }*/
    }
});
