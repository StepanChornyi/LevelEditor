import * as THREE from 'three';

export default class GizmoTorus extends THREE.Object3D {
    constructor(radius, thickness = 0.01, color = 0xffffff, axis = "XYZ", arc = 360) {
        super();

        const torusParams = new THREE.Vector2(radius, thickness);

        const segments = Math.round((arc / 360) * 50);

        const torusGeom = new THREE.TorusGeometry(torusParams.x, torusParams.y, 8, segments, THREE.MathUtils.degToRad(arc));
        const torusMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });

        const torus = this.torus = new THREE.Mesh(torusGeom, torusMat);

        this.interactiveTorus = new THREE.Mesh(
            new THREE.TorusGeometry(torusParams.x, torusParams.y * 3, 6, Math.round(segments / 2), THREE.MathUtils.degToRad(arc)),
            new THREE.MeshBasicMaterial({ color: 0xeb34bd, wireframe: true })
        );

        this.torus.material.opacity = 0.8;
        this.torus.material.transparent = true;
        this.torus.material.alphaToCoverage = true;

        this.torusAxis = axis;

        this.name = axis;

        torus.onBeforeRender = (...args) => this.onBeforeRender(...args);

        // torus.visible = false;
        this.interactiveTorus.visible = false;

        // this.scale.setScalar(3)

        this.add(torus, this.interactiveTorus);
    }

    intersects(pointer, camera) {
        const raycaster = new THREE.Raycaster();

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects([this.interactiveTorus]);

        if (!intersects.length)
            return null;

        intersects.sort((a, b) => a.distance - b.distance);

        return intersects[0];
    }

    get hovered() {
        return this._hovered;
    }

    set hovered(val) {
        this.torus.material.opacity = val ? 1 : 0.8;
        // this.material.uniforms.opacity.value = val ? 0.9 : 0.8;
        this._hovered = val;
    }

    onBeforeRender(_, __, camera) {
        const torus = this.torus;

        const pos = torus.getWorldPosition(new THREE.Vector3());

        const cameraNormal = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1);

        switch (this.torusAxis) {
            case 'X':
                torus.rotation.set(
                    Math.atan2(cameraNormal.z, cameraNormal.y),
                    THREE.MathUtils.degToRad(90),
                    0
                );
                break;

            case 'Y':
                torus.rotation.set(
                    THREE.MathUtils.degToRad(90),
                    Math.atan2(cameraNormal.x, cameraNormal.z),
                    0,
                    "YXZ"
                );
                break;

            case 'Z':
                torus.rotation.set(
                    0,
                    0,
                    Math.atan2(-cameraNormal.x, cameraNormal.y)
                );

                break;

            case 'XYZ': {
                torus.quaternion.copy(camera.quaternion);
            }
        }

        torus.matrixWorldNeedsUpdate = true;

        this.interactiveTorus.rotation.copy(torus.rotation);
        this.interactiveTorus.quaternion.copy(torus.quaternion);
    }
}


function intColorToVec3(color) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    return new THREE.Vector3(r / 255, g / 255, b / 255);
}