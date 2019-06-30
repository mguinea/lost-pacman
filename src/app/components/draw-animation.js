AFRAME.registerComponent('draw-animation', {
  schema: {default: ''},
  init: function () {
      var el = this.el;
      this.canvas = document.getElementById(el.canvas.id);
      this.canvas.style.imageRendering = '-moz-crisp-edges';
      this.canvas.style.imageRendering = '-o-crisp-edges';
      this.canvas.style.imageRendering = '-webkit-optimize-contrast';
      this.canvas.style.imageRendering = 'crisp-edges';

      this.ctx = this.canvas.getContext('2d');
      setVendorAttribute( this.ctx , 'imageSmoothingEnabled', false );

      this.sprites = [
          [0, 0],
          [11,0]
      ];
      this.spriteSelected = 0;
      this.spritesheet = document.getElementById("blinky");

  },
  tick(t, timeDelta){
      var el = this.el,
        position = el.getAttribute('position');

      this.spriteSelected = (~~(t*0.002)%2); // (~~(elapsedTime*framesPerSecond)%totalFrames)
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.spritesheet, this.sprites[this.spriteSelected][0], this.sprites[this.spriteSelected][1], 11, 8, 0, 0, 110, 80);
  }
});
