AFRAME.registerComponent('collider-check-cookie', {
    init: function () {
        this.el.addEventListener('collide', function (evt) {
            console.log('This A-Frame entity collided with another entity!');
        });
    }
});
