import { Dot } from '../entities/Dot';
import { Phantom } from '../entities/Phantom';

AFRAME.registerSystem('game', {
    schema: {
        entities: { type: 'array' },
        namedEntities: { type: 'array'}
    },

    init: function () {
        this.loadAssets();
        this.spawnEntity(Phantom, 0, 0, -5);
    },

    tick(t, timeDelta){
        this.updateEntities();
        this.drawEntities();
    },

    loadAssets() {

    },

    spawnEntity(entityClass, x, y, z, settings) {
        if( !entityClass ) {
            throw("Can't spawn entity of type " + entityClass);
        }
        let ent = new (entityClass)( x, y, z, settings || {} );
        this.data.entities.push( ent );
        if( ent.name ) {
            this.data.namedEntities[ent.name] = ent;
        }
        return ent;
    },

    updateEntities: function() {
        for( let i = 0; i < this.data.entities.length; ++i ) {
            var ent = this.data.entities[i];
            if( !ent._killed ) {
                ent.update();
            }
        }
    },

    drawEntities: function() {
        for( let i = 0; i < this.data.entities.length; ++i ) {
            this.data.entities[i].draw();
        }
    }

});
