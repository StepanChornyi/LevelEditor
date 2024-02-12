import * as THREE from 'three';

import { X_AXIS_COLOR, Y_AXIS_COLOR, Z_AXIS_COLOR } from '../GismoConstants';
import RectPlane from '../components/rectPlane/RectPlane';
import GizmoCircle from '../components/gizmoCircle/GizmoCircle';
import AxisControl from '../components/AxisControl';
import AbstractGizmo from '../components/AbstractGizmo';
import GizmoTorus from '../components/gizmoTorus/GizmoTorus';
import GizmoDisc from '../components/gizmoDisc/GizmoDisc';

const DISC_GRAY_COLOR = 0xcbcbcb;

export default class RotateGizmo extends AbstractGizmo {
    constructor() {
        super();

        const torusX = new GizmoTorus(0.6, 0.011, X_AXIS_COLOR, "X", 180);
        const torusY = new GizmoTorus(0.6, 0.011, Y_AXIS_COLOR, "Y", 180);
        const torusZ = new GizmoTorus(0.6, 0.011, Z_AXIS_COLOR, "Z", 180);

        this.axisRotateControl = [torusX, torusY, torusZ];

        const circleX = new GizmoTorus(0.6, 0.011, X_AXIS_COLOR, "", 360);
        const circleY = new GizmoTorus(0.6, 0.011, Y_AXIS_COLOR, "", 360);
        const circleZ = new GizmoTorus(0.6, 0.011, Z_AXIS_COLOR, "", 360);

        const discX = new GizmoDisc(0.6, DISC_GRAY_COLOR, X_AXIS_COLOR);
        const discY = new GizmoDisc(0.6, DISC_GRAY_COLOR, Y_AXIS_COLOR);
        const discZ = new GizmoDisc(0.6, DISC_GRAY_COLOR, Z_AXIS_COLOR);

        discX.visible = discY.visible = discZ.visible = false;

        discX.add(circleX);
        discY.add(circleY);
        discZ.add(circleZ);

        discX.rotation.y = THREE.MathUtils.degToRad(90);
        discY.rotation.x = THREE.MathUtils.degToRad(90);

        this.rotationDiscs = [discX, discY, discZ];

        const ringOuter = this.ringOuter = new GizmoTorus(0.8, 0.01, 0xffffff, "");

        ringOuter.name = "XYZ";

        const discOuter = this.discOuter = new GizmoDisc(0.8, Z_AXIS_COLOR, 0, true, 0.82);
        const discInner = this.discInner = new GizmoDisc(0.6, DISC_GRAY_COLOR, 0, true);

        discOuter.opacity = 0;
        discOuter.hoverOpacity = 0;
        discInner.opacity = 0;
        discInner.hoverOpacity = 0.2;

        discOuter.add(ringOuter)

        this.setMyRotation(null, null);

        this.add(...this.axisRotateControl, ...this.rotationDiscs, discOuter, discInner);
    }

    setMyRotation(disc, angle) {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].visible = false;
        }

        if (!disc)
            return;

        disc.visible = true;
        disc.setSector(angle, true);
        // this.discOuter.setSector(angle, angleOffset, true);
    }

    reset() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].visible = true;
        }

        for (let i = 0; i < this.rotationDiscs.length; i++) {
            this.rotationDiscs[i].visible = false;
        }

        this.discOuter.setSector(null);
        this.discOuter.hovered = false;
        this.ringOuter.visible = true;
    }

    getActiveElement(pointer, camera) {
        const intersections = [];

        const intersectsOuter = this.discOuter.intersects(pointer, camera);
        const intersectsInner = this.discInner.intersects(pointer, camera);

        if (!intersectsOuter)
            return null;

        for (let i = 0; i < this.axisRotateControl.length; i++) {
            const object = this.axisRotateControl[i];
            const intersection = this.axisRotateControl[i].intersects(pointer, camera);

            if (intersection) {
                intersections.push({ distance: intersection.distance, object })
            }
        }

        if (intersections.length) {
            intersections.sort((a, b) => a.distance - b.distance);

            return intersections[0].object;
        } else if (intersectsInner) {
            return this.discInner;
        } else {
            return this.ringOuter;
        }
    }

    updatePointerPosition(pointer, camera) {
        this.ringOuter.hovered = false;

        super.updatePointerPosition(pointer, camera);
    }
}