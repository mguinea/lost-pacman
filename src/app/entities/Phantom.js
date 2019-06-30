import { Entity } from './Entity';

export class Phantom extends Entity {
    constructor() {
        super();

        let canvasId = super.attachCanvas();
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

        this.el.setAttribute('mixin', 'phantom');

        this.el.className = 'phantom';
    }

    initAnimation() {
        var el = this.el;
        el.canvas = document.getElementById(el.canvas.id);
        el.canvas.style.imageRendering = '-moz-crisp-edges';
        el.canvas.style.imageRendering = '-o-crisp-edges';
        el.canvas.style.imageRendering = '-webkit-optimize-contrast';
        el.canvas.style.imageRendering = 'crisp-edges';

        el.ctx = el.canvas.getContext('2d');
        this.setVendorAttribute( el.ctx , 'imageSmoothingEnabled', false );

        this.spritesheet = document.getElementById("phantom");
    }

    setVendorAttribute ( el, attr, val ) {
        var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
        el[attr] = el['ms'+uc] = el[uc] = el['webkit'+uc] = el['o'+uc] = val;
    }
}