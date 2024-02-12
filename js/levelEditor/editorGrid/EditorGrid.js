import * as THREE from 'three';

import vertexShader from "./editorGrid.vs.glsl";
import fragmentShader from "./editorGrid.fs.glsl";

// console.log(TransformControls);
export default class EditorGrid extends THREE.Mesh {
    constructor() {
        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader, uniforms: {
                cameraOrigin: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
                colorX: { value: intColorToVec3(0x8f424c) },
                colorY: { value: intColorToVec3(0x3b7836) },
                colorZ: { value: intColorToVec3(0x3e608a) },
                gridType: { value: GRID_TYPE.XY },
                opacity: { value: 1 }
            },
        });

        const planeGeometry = new THREE.PlaneGeometry(10000, 10000, 10, 10);

        material.alphaToCoverage = true;
        material.transparent = true;
        material.side = THREE.DoubleSide;

        super(planeGeometry, material)

        this.gridNormal = new THREE.Vector3();
        this.fadeDotVal = 1 / 0.15;

        this.setType(GRID_TYPE.XZ);
    }

    setType(type) {
        this.rotation.x = this.rotation.y = 0;

        switch (type) {
            case GRID_TYPE.XY:
                this.material.uniforms.gridType.value = GRID_TYPE.XY;
                this.gridNormal.set(0, 0, 1);
                break;
            case GRID_TYPE.XZ:
                this.gridNormal.set(0, 1, 0);
                this.rotation.x = -Math.PI * 0.5;
                this.material.uniforms.gridType.value = GRID_TYPE.XZ;
                break;
            case GRID_TYPE.YZ:
                this.gridNormal.set(1, 0, 0);
                this.rotation.y = -Math.PI * 0.5;
                this.material.uniforms.gridType.value = GRID_TYPE.YZ;
                break;
        }

        return this;
    }

    setTarget(target) {
        this.material.uniforms.cameraOrigin.value = target;
    }

    setCamera(camera) {
        this.position.x = this.position.y = this.position.z = 0;

        switch (this.material.uniforms.gridType.value) {
            case GRID_TYPE.XY:
                this.position.x = camera.position.x;
                this.position.y = camera.position.y;
                break;
            case GRID_TYPE.XZ:
                this.position.x = camera.position.x;
                this.position.z = camera.position.z;
                break;
            case GRID_TYPE.YZ:
                this.position.y = camera.position.y;
                this.position.z = camera.position.z;
                break;
        }
    }

    onBeforeRender(_, __, camera) {
        this.material.uniforms.opacity.value = this.getOpacity(camera);
    }

    getOpacity(camera) {
        const cameraNormal = camera.getWorldDirection(new THREE.Vector3());
        const dot = cameraNormal.dot(this.gridNormal);

        return Math.min(1, Math.abs(dot) * this.fadeDotVal);
    }
}

const GRID_TYPE = {
    XZ: 0,
    XY: 1,
    YZ: 2
}

function intColorToVec3(color) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    return new THREE.Vector3(r / 255, g / 255, b / 255);
}