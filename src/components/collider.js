/*AFRAME.registerComponent('collider-c', {
  dependencies: ['raycaster'],
  init: function () {
    var entity = this.el;
    this.el.addEventListener('raycaster-intersected', function (e) {
        //console.log(e.currentTarget.id);
        //var cookie = document.querySelector(e.currentTarget.id);
        //console.log(cookie)

        var visible = entity.getAttribute('visible');
        if(visible == true){
            score ++;
        }
        //if (condition) {
        //entity.parentNode.removeChild(entity);
        entity.setAttribute('visible', "false")


        //}
    });
  }
});
*/

AFRAME.registerComponent('collider-c', {
  schema: {
    target: { default: '' }
  },

  /**
   * Calcular objetivos.
   */
  init: function () {
    var targetEls = this.el.sceneEl.querySelectorAll(this.data.target);
    this.targets = [];
    for (var i = 0; i &lt; targetEls.length; i++) {
      this.targets.push(targetEls[i].object3D);
    }
    this.el.object3D.updateMatrixWorld();
  },

  /**
   * Verificar por colisiones (para el cilindro).
   */
  tick: function (t) {
    var collisionResults;
    var directionVector;
    var el = this.el;
    var sceneEl = el.sceneEl;
    var mesh = el.getObject3D('mesh');
    var object3D = el.object3D;
    var raycaster;
    var vertices = mesh.geometry.vertices;
    var bottomVertex = vertices[0].clone();
    var topVertex = vertices[vertices.length - 1].clone();

    // Calcular posiciones absolutas de inicio y fin de la entidad.
    bottomVertex.applyMatrix4(object3D.matrixWorld);
    topVertex.applyMatrix4(object3D.matrixWorld);

    // Vector de inicio a fin de la entidad.
    directionVector = topVertex.clone().sub(bottomVertex).normalize();

    // Rayo de la colisión.
    raycaster = new THREE.Raycaster(bottomVertex, directionVector, 1);
    collisionResults = raycaster.intersectObjects(this.targets, true);
    collisionResults.forEach(function (target) {
      // Informar a la entidad sobre la colisión.
      target.object.el.emit('collider-hit', {target: el});
    });
  }
});
