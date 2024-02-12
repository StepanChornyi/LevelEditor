
import * as THREE from 'three';

import { X_AXIS_COLOR, Y_AXIS_COLOR, Z_AXIS_COLOR } from './GismoConstants';

export default class TransformAxisGuide extends THREE.Object3D {
    constructor() {
        super();

        const lineLength = 100000;

        const xAxis = this.xAxis = this.createLine([-lineLength, 0, 0, lineLength, 0, 0], X_AXIS_COLOR);
        const yAxis = this.yAxis = this.createLine([0, -lineLength, 0, 0, lineLength, 0], Y_AXIS_COLOR);
        const zAxis = this.zAxis = this.createLine([0, 0, -lineLength, 0, 0, lineLength], Z_AXIS_COLOR);

        this.add(xAxis, yAxis, zAxis);
    }

    setAxisVisibility(axisStr) {
        const axis = axisStr.toUpperCase();

        this.xAxis.visible = axis.includes("X");
        this.yAxis.visible = axis.includes("Y");
        this.zAxis.visible = axis.includes("Z");
    }

    createLine([x1, y1, z1, x2, y2, z2], color) {
        const material = new THREE.LineBasicMaterial({ color, opacity: 0.7 });
        const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)]);

        material.transparent = true;

        return new THREE.Line(geometry, material);
    }
}