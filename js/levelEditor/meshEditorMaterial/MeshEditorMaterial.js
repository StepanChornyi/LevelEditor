import * as THREE from 'three';

import vertexShader from "./meshEditorMaterial.vs.glsl";
import fragmentShader from "./meshEditorMaterial.fs.glsl";

export default class MeshEditorMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({ vertexShader, fragmentShader, uniforms: { color: { value: new THREE.Vector3(0.7, 0.7, 0.7) } } })

        this.alphaToCoverage = true;
        this.side = THREE.DoubleSide;
    }

    setColor(intColor) {
        this.uniforms.color.value.copy(intColorToVec3(intColor));
    }
}

function intColorToVec3(color) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    return new THREE.Vector3(r / 255, g / 255, b / 255);
}