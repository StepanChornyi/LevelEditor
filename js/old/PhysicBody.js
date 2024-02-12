import * as THREE from 'three';
import * as CANNON from 'cannon';

export default class PhysicBody {
    constructor() {
        this.body = new CANNON.Body({});
    }

    addTo(scene, world) {
        this.mesh && scene.add(this.mesh);
        world.addBody(this.body);

        return this;
    }

    onUpdate(dt) {
        if (this.mesh) {
            this.mesh.position.copy(this.body.position);
            this.mesh.quaternion.copy(this.body.quaternion);
        }
    }
}