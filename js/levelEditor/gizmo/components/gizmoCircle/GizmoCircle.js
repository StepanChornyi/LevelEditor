import * as THREE from 'three';

import vertexShader from "./gizmoCircle.vs.glsl";
import fragmentShader from "./gizmoCircle.fs.glsl";

export default class GizmoCircle extends THREE.Mesh {
    constructor(size) {
        const geom = new THREE.PlaneGeometry(size, size);

        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader, uniforms: {
                opacity: { value: 0.8 },
                viewSize: { value: new THREE.Vector2() },
                // strokeSize: { value: strokeSize / size }
            },
        });

        material.alphaToCoverage = true;
        material.transparent = true;
        material.side = THREE.DoubleSide;
        material.depthTest = false;

        super(geom, material);

        this._hovered = false;
    }

    intersects(pointer, camera) {
        const position = this.position.clone().applyMatrix4(this.matrixWorld).project(camera);

        const pointerPosScaled = new THREE.Vector3(pointer.x * camera.aspect, pointer.y);
        const viewPosScaled = position.clone().multiply(new THREE.Vector3(camera.aspect, 1, 0))

        const dist = pointerPosScaled.distanceTo(viewPosScaled);

        if (dist < 0.06) {
            return position;
        }

        return null;
    }

    get hovered() {
        return this._hovered;
    }

    set hovered(val) {
        this.material.uniforms.opacity.value = val ? 0.9 : 0.8;
        this._hovered = val;
    }

    onBeforeRender(renderer, __, camera) {
        this.quaternion.copy(camera.quaternion);

        const { z: width, w: height } = renderer.getRenderTarget()?.viewport || renderer.getViewport(new THREE.Vector4());

        this.material.uniforms.viewSize.value.set(width, height);

        this.updateWorldMatrix();
    }
}

function intColorToVec3(color) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    return new THREE.Vector3(r / 255, g / 255, b / 255);
}