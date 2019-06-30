import { Entity } from './Entity';

export class Phantom extends Entity {
    constructor() {
        super();

        let canvasId = 'canvas-' + (Math.random() * 100000000000000000);
        super.attachCanvas(canvasId, 1400, 1500);
        this.initAnimation();

        this.el.setAttribute('geometry', {
            primitive: 'plane',
            width: 14,
            height: 15
        });
        this.el.setAttribute('material', {
            opacity: 1,
            shader: 'standard',
            src: '#' + canvasId,
            transparent: true
        });
        this.el.setAttribute('position', {
            x: 0,
            y: 0, 
            z: -5
        });
        this.el.setAttribute('rotation', {
            x: 0,
            y: 0,
            z: 0
        });
        this.el.setAttribute('visible', true);

        this.el.className = 'phantom';
    }

    initAnimation() {
        this.spritesheet = document.getElementById("phantom");
    }
}