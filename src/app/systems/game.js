import { Dot } from '../entities/Dot';

AFRAME.registerSystem('game', {
    schema: {},  // System schema. Parses into `this.data`.

    init: function () {
        let d = new Dot();
    },

    tick(t, timeDelta){
    }
});
