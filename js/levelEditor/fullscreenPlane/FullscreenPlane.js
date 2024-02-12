import * as THREE from 'three';

import vertexShader from "./fullscreenPlane.vs.glsl";
import fs from "./fullscreenPlane.fs.glsl";

// console.log(TransformControls);
export default class FullscreenPlane extends THREE.Mesh {
    constructor(texture, fragmentShader = fs) {
        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader, uniforms: {
                texture0: { value: texture },
            },
        });

        material.alphaToCoverage = true;

        super(FullscreenPlane.createGeometry(), material)
    }

    onBeforeRender() {
        this.frustumCulled = false;
    }

    static createGeometry() {
        const geometry = new THREE.BufferGeometry();

        const vertices = new Float32Array([
            -1.0, -1.0, 0,
            1.0, -1.0, 0,
            1.0, 1.0, 0,
            -1.0, 1.0, 0,
        ]);

        const indices = [
            0, 1, 2,
            2, 3, 0,
        ];

        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        return geometry;
    }
}
