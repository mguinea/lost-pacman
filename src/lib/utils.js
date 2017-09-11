function clone(obj) {
	var copy;

	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj! Its type isn't supported.");
}

function addTriangle (vA, vB, vC, r, pos, c, entityToAttach){
	var scene 	= document.querySelector('a-scene'),
		el 		= document.createElement('a-entity');
	el.setAttribute('geometry', {
		primitive: 'triangle',
		vertexA: AFRAME.utils.coordinates.stringify(vA),
		vertexB: AFRAME.utils.coordinates.stringify(vB),
		vertexC: AFRAME.utils.coordinates.stringify(vC),
	});
	el.setAttribute('position', {x : pos.x, y : pos.y, z : pos.z});
	el.setAttribute('rotation', {x : 0, y : r, z : 0});
	el.setAttribute('material', {color:c});
	entityToAttach.appendChild(el);
}

function addPlane(w, h, r, pos, c, s, entityToAttach){
	addTriangle ({x:0,y:0,z:0}, {x:0,y:h*s,z:0}, {x:w*s,y:0,z:0}, r, pos, c, entityToAttach);
	addTriangle ({x:w*s,y:0,z:0}, {x:0,y:h*s,z:0}, {x:w*s,y:h*s,z:0}, r, pos, c, entityToAttach);
}

function angleTo ( e1, e2 ) {
    return Math.atan2(
        (e2.x) - (e1.x),
        (e2.z) - (e1.z)
    );
}
