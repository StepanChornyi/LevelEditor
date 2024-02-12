import * as THREE from 'three';

import vertexShader from "./rectPlane.vs.glsl";
import fragmentShader from "./rectPlane.fs.glsl";

export default class RectPlane extends THREE.Mesh {
    constructor(color, size, strokeSize) {
        const geom = new THREE.PlaneGeometry(size * 2, size * 2);

        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader, uniforms: {
                color: { value: intColorToVec3(color) },
                opacity: { value: 1.0 },
                viewSize: { value: new THREE.Vector2() },
                strokeSize: { value: strokeSize / size }
            },
        });

        material.depthTest = false;
        material.alphaToCoverage = true;
        material.transparent = true;
        material.side = THREE.DoubleSide;

        super(geom, material);

        this._hovered = false;
    }

    onBeforeRender(renderer) {
        const { z: width, w: height } = renderer.getRenderTarget()?.viewport || renderer.getViewport(new THREE.Vector4());

        this.material.uniforms.viewSize.value.set(width, height);
    }

    isInteractive(camera) {
        const a = new THREE.Vector3(0, 0, 0).applyMatrix4(this.matrixWorld).project(camera);
        const b = new THREE.Vector3(0, 1, 0).applyMatrix4(this.matrixWorld).project(camera);

        b.sub(a);
        b.normalize();

        const cameraNormal = camera.getWorldDirection(new THREE.Vector3());

        return Math.abs(cameraNormal.dot(b)) > 0.3;
    }

    get hovered() {
        return this._hovered;
    }

    set hovered(val) {
        this.material.uniforms.opacity.value = val ? 1 : 0.85;
        this._hovered = val;
    }
}


function intColorToVec3(color) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    return new THREE.Vector3(r / 255, g / 255, b / 255);
}