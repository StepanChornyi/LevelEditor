import * as THREE from 'three';

import TranslateGizmo from './translateGizmo/TranslateGizmo';
import ScaleGizmo from './scaleGizmo/ScaleGizmo';
import RotateGizmo from './rotateGizmo/RotateGizmo';

export default class Gizmo extends THREE.Object3D {
    constructor() {
        super();

        this.translateGizmo = new TranslateGizmo();
        this.scaleGizmo = new ScaleGizmo();
        this.rotateGizmo = new RotateGizmo();

        this.add(this.translateGizmo, this.scaleGizmo, this.rotateGizmo);

        this.rotateGizmo.addEventListener("mmm", (event) => {
            this.dispatchEvent(event);
        })

        this.mode = 'none';
    }

    get mode() {
        return this._mode;
    }

    set mode(val) {
        this._mode = val;

        this.translateGizmo.visible = false;
        this.scaleGizmo.visible = false;
        this.rotateGizmo.visible = false;

        if (this.activeGizmo)
            this.activeGizmo.visible = true;
    }

    get activeGizmo() {
        switch (this._mode) {
            case 'translate':
                return this.translateGizmo;
            case 'scale':
                return this.scaleGizmo;
            case 'rotate':
                return this.rotateGizmo;
        }
    }

    getActiveElement(pointer, camera) {
        return this.activeGizmo && this.activeGizmo.getActiveElement(pointer, camera);
    }

    updatePointerPosition(pointer, camera) {
        this.activeGizmo && this.activeGizmo.updatePointerPosition(pointer, camera);
    }

    updateScale(camera) {
        const cameraNormal = camera.getWorldDirection(new THREE.Vector3());

        const plane = new THREE.Plane(cameraNormal);

        plane.translate(camera.position);

        const scale = plane.distanceToPoint(this.position) / 5;

        this.scale.set(scale, scale, scale);
    }

    reset() {
        if (this.activeGizmo && this.activeGizmo.reset) {
            this.activeGizmo.reset();
        }
    }
}