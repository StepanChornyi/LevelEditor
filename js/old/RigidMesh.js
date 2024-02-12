import * as THREE from 'three';
import * as CANNON from 'cannon';
import { groundMaterial } from './CannonMaterials';

export default class RigidMesh {
    constructor(objData, transformConfig) {
        for (let i = 0; i < objData.children.length; i++) {
            const child = objData.children[i];
            const childName = child.name;

            if (childName.includes("col_")) {

            } else {
                this.mesh = child.clone();
            }
        }

        this.body = new CANNON.Body({
            mass: 0, // kg
            position: new CANNON.Vec3(0, 0, 0), // m
            material: groundMaterial,
        });

        if (!transformConfig)
            return;

        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

        for (let i = 0; i < objData.children.length; i++) {
            const child = objData.children[i];
            const childName = child.name;

            if (!childName.includes("col_"))
                continue;

            let shape = null;

            if (childName.includes("box")) {
                const box = child.geometry.boundingBox;

                shape = new CANNON.Box(new CANNON.Vec3()
                    .copy(box.max.clone().multiply(transformConfig.scale)));
            } else if (childName.includes("mesh")) {
                shape = new CANNON.Trimesh(child.geometry.attributes.position.array, child.geometry.index.array);
                shape.scale.copy(transformConfig.scale);
            }

            this.body.addShape(
                shape,
                new CANNON.Vec3().copy(child.position.clone().multiply(transformConfig.scale)),
                new CANNON.Quaternion().copy(child.quaternion)
            )

            const mesh = child.clone();

            mesh.material = material;

            this.mesh.add(mesh);
        }

        this.body.position.copy(transformConfig.position)
        this.body.quaternion.copy(transformConfig.quaternion);

        this.mesh.scale.copy(transformConfig.scale);
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    addTo(scene, world) {
        scene.add(this.mesh);
        world.addBody(this.body);

        return this;
    }
}