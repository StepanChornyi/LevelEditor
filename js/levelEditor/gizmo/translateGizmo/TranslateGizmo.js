import * as THREE from 'three';

import { X_AXIS_COLOR, Y_AXIS_COLOR, Z_AXIS_COLOR } from '../GismoConstants';
import RectPlane from '../components/rectPlane/RectPlane';
// import GizmoCircle from '../components/gizmoCircle/GizmoCircle';
import AxisControl from '../components/AxisControl';
import AbstractGizmo from '../components/AbstractGizmo';
import GizmoTorus from '../components/gizmoTorus/GizmoTorus';
import GizmoDisc from '../components/gizmoDisc/GizmoDisc';

export default class TranslateGizmo extends AbstractGizmo {
    constructor() {
        super();

        this.init();
    }

    init() {
        const arrowX = this.createArrow(X_AXIS_COLOR);
        const arrowY = this.createArrow(Y_AXIS_COLOR);
        const arrowZ = this.createArrow(Z_AXIS_COLOR);

        arrowX.name = "X";
        arrowY.name = "Y";
        arrowZ.name = "Z";

        this.arrows = [arrowX, arrowY, arrowZ];

        const PI05 = Math.PI * 0.5;

        arrowX.rotation.z = -PI05;
        arrowZ.rotation.x = PI05;

        const rectsSize = 0.1;
        const rectsOffset = 0.3;

        const rectXY = new RectPlane(Z_AXIS_COLOR, rectsSize, rectsSize * 0.2);
        const rectXZ = new RectPlane(Y_AXIS_COLOR, rectsSize, rectsSize * 0.2);
        const rectYZ = new RectPlane(X_AXIS_COLOR, rectsSize, rectsSize * 0.2);

        rectXY.name = "XY";
        rectXZ.name = "XZ";
        rectYZ.name = "YZ";

        rectXY.position.set(rectsOffset, rectsOffset, 0);

        rectXZ.position.set(rectsOffset, 0, rectsOffset);
        rectXZ.rotation.x = PI05;

        rectYZ.position.set(0, rectsOffset, rectsOffset);
        rectYZ.rotation.y = PI05;

        this.rects = [rectXY, rectXZ, rectYZ];

        const allAxisTorus = this.allAxisTorus = new GizmoTorus(0.15);
        const allAxisCircle = this.allAxisCircle = new GizmoDisc(0.17, 0, 0, true);

        allAxisCircle.opacity = 0;

        allAxisTorus.name = "XYZ";

        this.add(...this.arrows, ...this.rects, allAxisTorus, allAxisCircle);
    }

    createArrow(color) {
        return new AxisControl(color, AxisControl.ARROW);
    }

    getActiveElement(pointer, camera) {
        const intersections = [];

        for (const arrow of this.arrows) {
            const point = arrow.intersects(pointer, camera);

            if (point) {
                intersections.push({ point, object: arrow })
            }
        }

        {
            const point = this.allAxisCircle.intersects(pointer, camera);

            point && intersections.push({ point, object: this.allAxisTorus })
        }

        {
            const raycaster = new THREE.Raycaster();

            raycaster.setFromCamera(pointer, camera);

            const intersects = raycaster.intersectObjects(this.rects);

            for (const itr of intersects) {
                if (itr.object.isInteractive(camera)) {
                    itr.point.applyMatrix4(itr.object.matrixWorld).project(camera);
                    intersections.push(itr);
                }
            }
        }

        intersections.sort((a, b) => a.point.z - b.point.z);

        if (intersections.length) {
            return intersections[0].object;
        }

        return null;
    }
}