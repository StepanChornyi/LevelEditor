import * as THREE from 'three';

export default class AxisControl extends THREE.Object3D {
    constructor(color, type = TYPE_ARROW) {
        super();

        this._hovered = false;

        this.isArrow = type === TYPE_ARROW;

        const offset = 0.2;
        const lineHeight = 0.8;
        const lineRadius = 0.008;
        const coneHeight = 0.13 * (this.isArrow ? 1 : 0.5)
        const coneRadius = 0.03;

        const coneGeometry = this.isArrow ?
            new THREE.ConeGeometry(coneRadius, coneHeight, 20) :
            new THREE.BoxGeometry(coneHeight, coneHeight, coneHeight);
        const lineGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, lineHeight, 8);

        this.opacity = {
            default: 0.88,
            hover: 1,
            factor: 1,
        };

        const material = this.material = new THREE.MeshBasicMaterial({ color, opacity: this.opacity.default });

        material.alphaToCoverage = true;
        material.transparent = true;

        const cone = new THREE.Mesh(coneGeometry, material);
        const line = new THREE.Mesh(lineGeometry, material);

        cone.position.y = lineHeight + coneHeight * 0.5 + offset;
        line.position.y = lineHeight * 0.5 + offset;

        this.pointStart = new THREE.Vector3(0, offset, 0);
        this.pointEnd = new THREE.Vector3(0, cone.position.y + coneHeight * 0.5, 0);

        this.add(cone, line);

        line.onBeforeRender = (...args) => this.onBeforeRender(...args);
    }

    onBeforeRender(_, __, camera) {
        const arrowDirection = this.localToWorld(new THREE.Vector3(0, 1, 0)).sub(this.localToWorld(new THREE.Vector3())).normalize();
        const cameraDirection = this.getWorldPosition(new THREE.Vector3()).sub(camera.position).normalize();
        const dot = arrowDirection.dot(cameraDirection);

        this.opacity.factor = THREE.MathUtils.clamp(THREE.MathUtils.lerp(-0.1, 100, 1 - Math.abs(dot)), 0, 1);

        this.hovered = this.hovered;
    }

    intersects(pointer, camera) {
        if (this.opacity.factor < 0.2)
            return null;

        const start = this.pointStart.clone().applyMatrix4(this.matrixWorld).project(camera);
        const end = this.pointEnd.clone().applyMatrix4(this.matrixWorld).project(camera);

        const line = new THREE.Line3(start.clone().setZ(0), end.clone().setZ(0));

        line.start.x *= camera.aspect;
        line.end.x *= camera.aspect;

        pointer = new THREE.Vector3(pointer.x * camera.aspect, pointer.y, 0);

        const closest = line.closestPointToPoint(pointer, true, new THREE.Vector3());

        if (closest.distanceTo(pointer) < 0.015) {
            const t = (closest.x - start.x) / (end.x - start.x);

            return start.clone().lerp(end, t);
        } else {
            return null;
        }
    }

    get hovered() {
        return this._hovered;
    }

    set hovered(val) {
        this.material.opacity = (val ? 1 : 0.85) * this.opacity.factor;
        this._hovered = val;
    }

    static get ARROW() {
        return TYPE_ARROW;
    }

    static get BOX() {
        return TYPE_BOX;
    }
}

const TYPE_ARROW = 'ARROW';
const TYPE_BOX = 'BOX';

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

class Segment {
    constructor(a, b) {
        this.a = a;
        this.b = b;
        this.ab = {
            x: b.x - a.x,
            y: b.y - a.y
        };

        this.length = distance(a, b);
    }

    cross(c) {
        const { a, ab } = this;

        return ab.x * (c.y - a.y) - ab.y * (c.x - a.x);
    };

    distanceFrom(c) {
        const { a, b, length } = this;

        return Math.min(distance(a, c),
            distance(b, c),
            Math.abs(this.cross(c) / length));
    };
}