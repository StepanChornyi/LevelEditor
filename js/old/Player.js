import * as THREE from 'three';
import * as CANNON from 'cannon';
import { groundMaterial } from './CannonMaterials';

const keysPressed = {};

window.addEventListener("keydown", (evt) => {
    keysPressed[evt.code] = true;
});

window.addEventListener("keyup", (evt) => {
    keysPressed[evt.code] = false;
});

const KEY_W = "KeyW";
const KEY_S = "KeyS";
const KEY_A = "KeyA";
const KEY_D = "KeyD";
const KEY_SPACE = "Space";

export default class Player {
    constructor() {
        const radius = 0.2;
        const offsetY = 1.2;

        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        console.log(__filename);


        const soldier = cloneGltf(THREE.Cache.files["Soldier"]);

        this.mesh = new THREE.Mesh(geometry, material)

        this.mesh2 = new THREE.Mesh(geometry, material)

        this.mesh2.position.y = offsetY;

        this.mesh.add(this.mesh2);
        this.mesh.add(soldier.scene);

        soldier.scene.position.y = -radius;


        this.body = new CANNON.Body({
            mass: 5, // kg
            position: new CANNON.Vec3(0, 5, 0), // m
            material: groundMaterial,
            fixedRotation: true,
            allowSleep: false
        });

        this.velocity = new THREE.Vector3();

        this.body.addShape(new CANNON.Sphere(radius), new CANNON.Vec3(0, 0, 0))
        this.body.addShape(new CANNON.Sphere(radius), new CANNON.Vec3(0, offsetY, 0))

        window.addEventListener("keydown", this.onKeyDown.bind(this));

        this.mesh.position.copy(this.body.position);
    }

    addTo(scene, world) {
        scene.add(this.mesh);
        world.addBody(this.body);

        return this;
    }

    onKeyDown({ code }) {
        if (code === KEY_SPACE) {
            this.body.velocity.y = 5;
        }
    }

    onUpdate(dt, cameraRotation) {
        const vec = new THREE.Vector2();

        if (keysPressed[KEY_W]) {
            vec.y = -1;
        } else if (keysPressed[KEY_S]) {
            vec.y = 1;
        }

        if (keysPressed[KEY_A]) {
            vec.x = -1;
        } else if (keysPressed[KEY_D]) {
            vec.x = 1;
        }

        if (vec.x !== 0 || vec.y !== 0) {
            const speed = dt * 10;

            cameraRotation = -cameraRotation + vec.angle();

            this.velocity.x += Math.cos(cameraRotation) * speed;
            this.velocity.z += Math.sin(cameraRotation) * speed;
        } else {
            this.velocity.x *= 0.98;
            this.velocity.z *= 0.98;
        }

        this.body.velocity.x = this.velocity.x;
        this.body.velocity.z = this.velocity.z;

        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }
}



function cloneGltf(gltf) {
    console.log(gltf);
    const clone = {
      animations: gltf.animations,
      scene: gltf.scene.clone(true)
    };
  
    const skinnedMeshes = {};
  
    gltf.scene.traverse(node => {
      if (node.isSkinnedMesh) {
        skinnedMeshes[node.name] = node;
      }
    });
  
    const cloneBones = {};
    const cloneSkinnedMeshes = {};
  
    clone.scene.traverse(node => {
      if (node.isBone) {
        cloneBones[node.name] = node;
      }
  
      if (node.isSkinnedMesh) {
        cloneSkinnedMeshes[node.name] = node;
      }
    });
  
    for (let name in skinnedMeshes) {
      const skinnedMesh = skinnedMeshes[name];
      const skeleton = skinnedMesh.skeleton;
      const cloneSkinnedMesh = cloneSkinnedMeshes[name];
  
      const orderedCloneBones = [];
  
      for (let i = 0; i < skeleton.bones.length; ++i) {
        const cloneBone = cloneBones[skeleton.bones[i].name];
        orderedCloneBones.push(cloneBone);
      }
  
      cloneSkinnedMesh.bind(
        new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
        cloneSkinnedMesh.matrixWorld);
    }
  
    return clone;
  }