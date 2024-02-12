import * as THREE from 'three';

import vertexShader from "./fullscreenPlane.vs.glsl";
import fragmentShader from "./fullscreenCopyPlane.fs.glsl";
import FullscreenPlane from './FullscreenPlane';


// console.log(TransformControls);
export default class FullscreenCopyPlane extends THREE.Mesh {
    constructor(colorTexture, depthTexture) {
        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader, uniforms: {
                colorTexture: { value: colorTexture },
                depthTexture: { value: depthTexture },
            },
        });

        material.alphaToCoverage = true;

        super(FullscreenPlane.createGeometry(), material)

        this.material = material;
    }

    onBeforeRender() {
        this.frustumCulled = false;
    }
}
