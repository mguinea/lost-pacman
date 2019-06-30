import { Entity } from './Entity';

export class Dot extends Entity{
    constructor() {
        super();

        this.el.setAttribute('position', { x: 0, y: 0, z: -5 });
        this.el.setAttribute('material', { color: '#ffffff' });
        this.el.setAttribute('visible', true);
        this.el.setAttribute('geometry', {
            primitive: 'sphere',
            radius : 1
        });

        // this.el.setAttribute('src', '#blinky');
        this.el.className = 'dot';
    }
}