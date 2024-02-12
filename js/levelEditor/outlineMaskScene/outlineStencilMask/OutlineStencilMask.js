import * as THREE from 'three';

import vertexShader from "./../../fullscreenPlane/fullscreenPlane.vs.glsl";
import fragmentShader from "./outlineStencilMask.fs.glsl";
import FullscreenPlane from '../../fullscreenPlane/FullscreenPlane';

export default class OutlineStencilMask extends THREE.Mesh {
    constructor(intColor) {
        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader, uniforms: {
                color: { value: intColorToVec3(intColor) },
            },
        });

        // material.alphaToCoverage  = true;
        material.blending = THREE.CustomBlending;
        material.blendEquation = THREE.MaxEquation;
        material.blendSrc = THREE.SrcAlphaFactor;
        material.blendDst = THREE.OneMinusSrcAlphaFactor;

        super(FullscreenPlane.createGeometry(), material)
    }

    onBeforeRender() {
        this.frustumCulled = false;
    }
}

function intColorToVec3(color) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    return new THREE.Vector3(r / 255, g / 255, b / 255);
}