export class Canvas {
    constructor(id, width, height) {
        let canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.width = width;
        canvas.height = height;
        canvas.style.imageRendering = '-moz-crisp-edges';
        canvas.style.imageRendering = '-o-crisp-edges';
        canvas.style.imageRendering = '-webkit-optimize-contrast';
        canvas.style.imageRendering = 'crisp-edges';

        return canvas;
    }

    static setVendorAttribute ( el, attr, val ) {
        var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
        el[attr] = el['ms'+uc] = el[uc] = el['webkit'+uc] = el['o'+uc] = val;
    }
}