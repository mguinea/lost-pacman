function aabbCollides(e1, e2){
	return(
			e1.x - (e1.width / 2) 				< e2.x - (e2.width / 2)   +   e2.width  &&
			e1.x - (e1.width / 2) + e1.width  	> e2.x - (e2.width / 2)     			&&
			e1.z - (e1.depth / 2)  				< e2.z - (e2.depth / 2)  +   e2.depth  	&&
			e1.z - (e1.depth / 2) + e1.depth  	> e2.z - (e2.depth / 2));
}
