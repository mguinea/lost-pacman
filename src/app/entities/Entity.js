export class Entity {
    constructor(x, y, z, settings) {
        this.scene = document.querySelector('a-scene');
        this.el = document.createElement('a-entity');

        this.el.currentAnim = null;
        this.el.settings = {};

        this.scene.appendChild(this.el);
    }


    attachCanvas() {
        let assets = document.querySelector('a-assets'),
            canvas = document.createElement('canvas'),
            id = 'canvas-' + (Math.random() * 100000000000000000);
        canvas.id = id;
        canvas.width = 1400;
        canvas.height = 1500;
        assets.appendChild(canvas);
        this.el.canvas = canvas;
        return id;
    }

    addAnim( name, velocity, frames) {

    }

    update() {

    }

    draw(t, timeDelta){
        var el = this.el, position = el.getAttribute('position');
        el.ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);
        el.ctx.drawImage(this.spritesheet, 0, 0, 14, 15, 0, 0, 1400, 1500);
        // var el = this.el, position = el.getAttribute('position');

        // this.spriteSelected = (~~(t*0.002)%2); // (~~(elapsedTime*framesPerSecond)%totalFrames)
        // el.ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);
        // el.ctx.drawImage(this.spritesheet, this.sprites[this.spriteSelected][0], this.sprites[this.spriteSelected][1], 11, 8, 0, 0, 110, 80);
    }
}