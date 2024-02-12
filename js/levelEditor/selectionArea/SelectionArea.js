import * as THREE from 'three';

import vertexShader from "./selectionArea.vs.glsl";
import fragmentShader from "./selectionArea.fs.glsl";
import FullscreenPlane from '../fullscreenPlane/FullscreenPlane';

export default class SelectionArea extends THREE.Mesh {
    constructor() {
        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader, uniforms: {
                textureSize: { value: new THREE.Vector2() },
                rect: { value: new THREE.Vector4() },
            },
        });

        material.alphaToCoverage = true;
        material.transparent = true;
        material.blending = THREE.AdditiveBlending;

        super(FullscreenPlane.createGeometry(), material)
    }

    onBeforeRender() {
        this.frustumCulled = false;
    }

    setRect(x, y, width, height) {
        this.material.uniforms.rect.value.set(x, y, width, height);
    }

    setSize(width, height) {
        this.material.uniforms.textureSize.value.set(width, height);
    }
}

