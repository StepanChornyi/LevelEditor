import * as THREE from 'three';

import vertexShader from "./fullscreenPlane.vs.glsl";
import fragmentShader from "./fullscreenPlaneOutline.fs.glsl";
import FullscreenPlane from './FullscreenPlane';

const yellowOutline = intColorToVec3(0xf19834);
const whiteOutline = intColorToVec3(0xe3e3e3);

export default class FullscreenOutlinePlane extends THREE.Mesh {
    constructor(stencilData) {
        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader, uniforms: {
                stencilData: { value: stencilData },
                outlineColor: { value: yellowOutline },
                textureSize: { value: new THREE.Vector2(10, 10) },
            },
        });

        material.alphaToCoverage = true;

        super(FullscreenPlane.createGeometry(), material)

        this.material = material;
    }

    onBeforeRender() {
        this.frustumCulled = false;
    }

    setIsPressed(val) {
        this.material.uniforms.outlineColor.value = val ? whiteOutline : yellowOutline;
    }

    setSize(width, height) {
        this.material.uniforms.textureSize.value.set(width, height);
    }
}

function intColorToVec3(color) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    return new THREE.Vector3(r / 255, g / 255, b / 255);
}