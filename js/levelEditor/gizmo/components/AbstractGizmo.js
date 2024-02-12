import * as THREE from 'three';

export default class AbstractGizmo extends THREE.Object3D {
    getActiveElement(_, __) {
        return null;
    }

    updatePointerPosition(pointer, camera) {
        for (const child of this.children) {
            child.hovered = false;
        }

        const activeElement = this.getActiveElement(pointer, camera);

        if (activeElement)
            activeElement.hovered = true;
    }
}