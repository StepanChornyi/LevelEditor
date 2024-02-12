import * as THREE from 'three';
import * as CANNON from 'cannon';

import sceneDataJSON from "../assets/sceneData.json";
import RigidMesh from './RigidMesh';
import { isPointerLocked, requestPointerLock } from './PinterLock';
import Player from './Player';

let movementX = 0;
let movementY = 0;

export default class Game {
    constructor() {
        const camera = this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
        camera.position.z = 1;
        camera.position.y = 1;

        camera.lookAt(0, 0, 0);

        const scene = this.scene = new THREE.Scene();

        const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.getElementById("container").appendChild(renderer.domElement);

        const light = new THREE.AmbientLight(0xffffff, 0.1); // soft white light
        scene.add(light);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        scene.add(directionalLight);

        directionalLight.position.set(3, 10, 0);
        directionalLight.target = new THREE.Object3D();

        const world = this.world = new CANNON.World();

        world.gravity.y = -15;

        window.addEventListener("mousemove", (evt) => {
            if (!isPointerLocked(renderer.domElement))
                return;

            movementX -= evt.movementX * 0.001;
            movementY -= evt.movementY * 0.001;
        })

        window.addEventListener("mousedown", () => requestPointerLock(renderer.domElement))

        this.init();
    }

    init() {
        const data = JSON.parse(sceneDataJSON);

        this.floorMaterial = new THREE.MeshLambertMaterial({ map: THREE.Cache.files["floorTexture"] });

        for (let i = 0; i < data.objects.length; i++) {
            this.initSceneObject(data.objects[i]);
        }

        this.player = new Player();

        this.player.addTo(this.scene, this.world);
    }

    initSceneObject(config) {
        const gltf = THREE.Cache.files[config.assetName];

        if (!gltf)
            return console.warn(`Asset ${config.assetName} not found`);

        const transformConfig = {
            position: new THREE.Vector3().fromArray(config.position),
            scale: new THREE.Vector3().fromArray(config.scale),
            quaternion: new THREE.Quaternion().fromArray(config.quaternion),
        }

        const rigidMesh = new RigidMesh(gltf.scene, transformConfig);

        rigidMesh.mesh.material = this.floorMaterial;

        rigidMesh.addTo(this.scene, this.world);
    }

    update(dt) {
        // controls.update();
        const stepsPerSecond = 300;
        const fixedTimeStep = 1 / stepsPerSecond;
        const maxSubSteps = 10;

        const { player, camera, scene, world, renderer } = this;

        world.step(fixedTimeStep, dt, maxSubSteps);

        player.onUpdate(dt, movementX);

        const cameraDistance = 5;

        camera.position.x = player.mesh.position.x + Math.sin(movementX) * cameraDistance;
        camera.position.y = player.mesh.position.y + 2;
        camera.position.z = player.mesh.position.z + Math.cos(movementX) * cameraDistance;
        camera.lookAt(player.mesh.position);

        camera.rotation.order = "YXZ"
        camera.rotation.x = movementY;
        camera.rotation.z = 0;

        this.player.mesh.rotation.y = camera.rotation.y;

        renderer.render(scene, camera);
    }

}
