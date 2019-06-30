import {Canvas} from "../classes/Canvas";

export class Entity {
    constructor(x, y, z, settings) {
        this.scene = document.querySelector('a-scene');
        this.el = document.createElement('a-entity');

        this.el.currentAnim = null;
        this.el.settings = {};

        this.scene.appendChild(this.el);
    }


    attachCanvas(id, width, height) {
        let assets = document.querySelector('a-assets');
        let canvas = new Canvas(id, width, height);

        assets.appendChild(canvas);
        this.el.canvas = canvas;
        let ctx = canvas.getContext('2d');
        Canvas.setVendorAttribute( ctx , 'imageSmoothingEnabled', false );
        this.el.ctx = ctx;
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