AFRAME.registerComponent('attach-canvas', {
    init: function () {
        let el = this.el,
            assets = document.querySelector('a-assets'),
            canvas = document.createElement('canvas'),
            id = 'canvas-' + (Math.random() * 100000000000000000);
        canvas.id = id;
        canvas.width = 110;
        canvas.height = 80;
        assets.appendChild(canvas);
        this.el.canvas = canvas;
    }
});
