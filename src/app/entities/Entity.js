export class Entity {
    constructor() {
        this.scene = document.querySelector('a-scene');
        this.el = document.createElement('a-entity');
        this.scene.appendChild(this.el);
    }
}