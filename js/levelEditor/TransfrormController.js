import * as THREE from 'three';

import TranslateGizmo from './gizmo/translateGizmo/TranslateGizmo';
import TransformAxisGuide from './gizmo/TransformAxisGuide';
import ScaleGizmo from './gizmo/scaleGizmo/ScaleGizmo';
import Gizmo from './gizmo/Gizmo';
import { X_AXIS_COLOR, Y_AXIS_COLOR, Z_AXIS_COLOR } from './gizmo/GismoConstants';

const _raycaster = new THREE.Raycaster();

export default class TransformController extends THREE.EventDispatcher {
    constructor(scene, camera) {
        super();

        this.camera = camera;
        this.scene = scene;

        this.selectedObject = null;
        this.enabled = true;

        this.init();
    }

    get selected() {
        return this.selectedObject;
    }

    set selected(obj) {
        this.selectedObject = obj;

        if (this.selectedObject) {
            this.gizmo.visible = true;
            this.gizmo.position.copy(this.selectedObject.position);
        } else {
            this.gizmo.visible = false;
        }
    }

    init() {
        const { scene, camera } = this;

        const debug0 = new PlaneRaycastDebug({ planeColor: 0xf0dc43, intersectionColor: 0xa92ff5, rayColor: 0x5f90fa });
        const debug1 = new PlaneRaycastDebug({ planeColor: 0xf04343, intersectionColor: 0x2fe8f5, rayColor: 0x5ffa64 });

        // debug0.visible = debug1.visible = false;

        // scene.add(new TorusDebugger());

        scene.add(debug1, debug0);

        const transformAxisGuide = new TransformAxisGuide();
        const gizmo = this.gizmo = new Gizmo();

        gizmo.addEventListener("mmm", ({ start, end }) => {
            debug0.updatePoint(start);
            debug1.updatePoint(end);
        })

        transformAxisGuide.visible = false;

        scene.add(gizmo, transformAxisGuide);

        const castLine = new THREE.Line3();
        const cameraNormal = camera.getWorldDirection(new THREE.Vector3());
        const plane = new THREE.Plane(cameraNormal.clone().multiplyScalar(-1));

        let started = false;
        let mode = gizmo.mode = 'rotate';
        let startPointerPosition = new THREE.Vector2();
        let currentPointerPosition = new THREE.Vector2();

        let transformAxis = 'XYZ';
        let ctrlPressed = false;

        let prevAngle = 0;
        let angleAcc = 0;

        const objStartTransform = {
            position: new THREE.Vector3(),
            scale: new THREE.Vector3(),
            quaternion: new THREE.Quaternion(),
        };

        const updatePointerPos = (event) => {
            currentPointerPosition.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                - (event.clientY / window.innerHeight) * 2 + 1
            );

            ctrlPressed = event.ctrlKey;
        }

        window.addEventListener('pointerdown', (event) => {
            updatePointerPos(event);

            if (event.button !== 0) {
                return;
            }

            if (started) {
                endTransform();
            }

            if (!started && gizmo.visible) {
                const element = gizmo.getActiveElement(currentPointerPosition, camera);


                if (element) {
                    transformAxis = element.name;
                    startTransform();
                }
            }
        });

        window.addEventListener('pointermove', (event) => {
            updatePointerPos(event);

            if (!started) {
                gizmo.updatePointerPosition(currentPointerPosition, camera);
            } else {
                updateTransform();
            }
        });

        window.addEventListener('pointerup', (event) => {
            if (!started)
                return;

            endTransform();
        });

        const correctNormal = (normal) => {
            const YZ = new THREE.Vector3(1, 0, 0);
            const XZ = new THREE.Vector3(0, 1, 0);
            const XY = new THREE.Vector3(0, 0, 1);

            switch (transformAxis) {
                case 'X':
                    normal.copy(Math.abs(normal.dot(XZ)) > Math.abs(normal.dot(XY)) ? XZ : XY);
                    break;
                case 'Y':
                    normal.copy(Math.abs(normal.dot(YZ)) > Math.abs(normal.dot(XY)) ? YZ : XY);
                    break;
                case 'Z':
                    normal.copy(Math.abs(normal.dot(XZ)) > Math.abs(normal.dot(YZ)) ? XZ : YZ);
                    break;
                case 'YZ':
                    normal.copy(YZ);
                    break;
                case 'XZ':
                    normal.copy(XZ);
                    break;
                case 'XY':
                    normal.copy(XY);
                    break;
            }

            return normal;
        }

        const getWorldPointerPos = (pointerPos, planePos, planeNormal, isNormalCorrected) => {
            _raycaster.setFromCamera(pointerPos, camera);

            const ray = _raycaster.ray;

            castLine.start.copy(ray.origin);
            castLine.end.copy(ray.origin).add(ray.direction.clone().multiplyScalar(10000000));

            plane.normal.copy(planeNormal);
            plane.constant = 0;
            plane.translate(planePos);
            plane.position = planePos;

            return plane.intersectLine(castLine, new THREE.Vector3());
        }

        const startTransform = () => {
            if (!this.selectedObject)
                return;

            if (started) {
                endTransform(true);
            }

            started = true;

            objStartTransform.position.copy(this.selectedObject.position);
            objStartTransform.scale.copy(this.selectedObject.scale);
            objStartTransform.quaternion.copy(this.selectedObject.quaternion);

            prevAngle = null;
            angleAcc = 0;

            gizmo.visible = false;
            transformAxisGuide.position.copy(objStartTransform.position)

            startPointerPosition.copy(currentPointerPosition);

            this.dispatchEvent({ type: 'transformStart' });

            updateTransform();
        }

        const updateTransform = () => {
            if (!started)
                return;

            transformAxisGuide.visible = transformAxis !== "XYZ";
            transformAxisGuide.setAxisVisibility(transformAxis);

            if (mode === "translate") {
                translateUpdate();

                this.selectedObject.scale.copy(objStartTransform.scale);
                this.selectedObject.quaternion.copy(objStartTransform.quaternion);

            } else if (mode === "scale") {
                scaleUpdate();

                this.selectedObject.position.copy(objStartTransform.position);
                this.selectedObject.quaternion.copy(objStartTransform.quaternion);
            } else {
                updateRotate();

                this.selectedObject.scale.copy(objStartTransform.scale);
                this.selectedObject.position.copy(objStartTransform.position);
            }
        }

        const getActiveGizmoDisc = () => {
            switch (transformAxis) {
                case "X":
                    return gizmo.activeGizmo.rotationDiscs[0];
                case "Y":
                    return gizmo.activeGizmo.rotationDiscs[1];
                case "Z":
                    return gizmo.activeGizmo.rotationDiscs[2];
                default:
                    return gizmo.activeGizmo.discOuter;
            }
        }

        const updateRotate = () => {
            gizmo.visible = true;

            const activeDisc = getActiveGizmoDisc();
            const cameraNormal = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1);
            const discNormal = new THREE.Vector3(0, 0, -1).applyQuaternion(activeDisc.quaternion);

            const discBackface = -camera.position.clone().sub(this.selectedObject.position).dot(discNormal);

            const pointCenter = objStartTransform.position.clone();
            const pointStart = getWorldPointerPos(startPointerPosition, pointCenter, cameraNormal);
            const pointEnd = getWorldPointerPos(currentPointerPosition, pointCenter, cameraNormal);

            debug0.updateLine({ start: pointCenter, end: pointStart });
            debug1.updateLine({ start: pointCenter, end: pointEnd });

            pointCenter.project(camera);
            pointStart.project(camera).sub(pointCenter).normalize();
            pointEnd.project(camera).sub(pointCenter).normalize();

            const adjustmentPoint = getWorldPointerPos(pointCenter.clone().add(pointStart.clone().multiplyScalar(0.01)), objStartTransform.position, discNormal)

            activeDisc.adjustTo(adjustmentPoint);

            const angleStart = new THREE.Vector2(pointStart.y, pointStart.x).angle();
            const angleEnd = new THREE.Vector2(pointEnd.y, pointEnd.x).angle();

            if (prevAngle !== null) {
                if (angleEnd < Math.PI * 0.5 && prevAngle > Math.PI * 1.5) {
                    angleAcc += Math.PI * 2;
                }

                if (angleEnd > Math.PI * 1.5 && prevAngle < Math.PI * 0.5) {
                    angleAcc -= Math.PI * 2;
                }
            }

            const angle = (angleEnd - angleStart + angleAcc) * Math.sign(discBackface);

            prevAngle = angleEnd;

            gizmo.activeGizmo.setMyRotation(activeDisc, angle);

            const quaternion = new THREE.Quaternion().setFromAxisAngle(discNormal, angle);

            this.selectedObject.quaternion.copy(quaternion).multiply(objStartTransform.quaternion);
        }

        const scaleUpdate = () => {
            const planeNormal = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1);

            const scaleStart = getWorldPointerPos(objStartTransform.position, objStartTransform.position, planeNormal);
            const pointStart = getWorldPointerPos(startPointerPosition, objStartTransform.position, planeNormal);
            const pointEnd = getWorldPointerPos(currentPointerPosition, objStartTransform.position, planeNormal);

            const initialDist = scaleStart.distanceTo(pointStart);
            const currentDist = scaleStart.distanceTo(pointEnd);
            const sensitivity = 1;

            const scaleOffset = new THREE.Vector3().setScalar((currentDist - initialDist) * sensitivity);

            if (!transformAxis.includes('X')) scaleOffset.x = 0;
            if (!transformAxis.includes('Y')) scaleOffset.y = 0;
            if (!transformAxis.includes('Z')) scaleOffset.z = 0;

            if (ctrlPressed) {
                const snapFactor = 1 / 10;

                scaleOffset.x = Math.round(scaleOffset.x / snapFactor) * snapFactor;
                scaleOffset.y = Math.round(scaleOffset.y / snapFactor) * snapFactor;
                scaleOffset.z = Math.round(scaleOffset.z / snapFactor) * snapFactor;
            }

            const newScale = objStartTransform.scale.clone().add(scaleOffset);

            this.selectedObject.scale.copy(newScale);
        }

        const translateUpdate = () => {
            // debug1.visible = debug0.visible = true;

            const planeNormal = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1);

            const planePosition = getWorldPointerPos(startPointerPosition, objStartTransform.position, planeNormal);

            // debug0.update(plane, castLine, planePosition);
            correctNormal(planeNormal);

            const pointStart = getWorldPointerPos(startPointerPosition, planePosition, planeNormal);
            const pointEnd = getWorldPointerPos(currentPointerPosition, planePosition, planeNormal);

            if (!pointEnd)
                return;

            // debug1.updatePlane(plane);
            // debug1.updateLine({ start: pointStart, end: pointEnd });
            // debug1.updatePoint(pointEnd);

            const translateOffset = pointEnd.clone().sub(pointStart);

            if (!transformAxis.includes('X')) translateOffset.x = 0;
            if (!transformAxis.includes('Y')) translateOffset.y = 0;
            if (!transformAxis.includes('Z')) translateOffset.z = 0;

            if (ctrlPressed) {
                const snapFactor = 1 / 5;

                translateOffset.x = Math.round(translateOffset.x / snapFactor) * snapFactor;
                translateOffset.y = Math.round(translateOffset.y / snapFactor) * snapFactor;
                translateOffset.z = Math.round(translateOffset.z / snapFactor) * snapFactor;
            }

            const newPos = objStartTransform.position.clone().add(translateOffset);

            this.selectedObject.position.copy(newPos);
        }

        const endTransform = (cancel = false) => {
            if (!started)
                return;

            started = false;

            transformAxisGuide.visible = false;
            gizmo.visible = true;
            gizmo.reset();

            if (cancel) {
                this.selectedObject.position.copy(objStartTransform.position);
                this.selectedObject.scale.copy(objStartTransform.scale);
                this.selectedObject.quaternion.copy(objStartTransform.quaternion);
            }

            gizmo.position.copy(this.selectedObject.position);

            setTimeout(() => this.dispatchEvent({ type: 'transformEnd' }));

            // if (this.selectedObject) {
            //     this.selectedObject.position.copy(positionStart);
            // }
        }

        this.transformObject = (obj) => {
            transformAxis = "XYZ";

            endTransform(true);

            this.selected = obj;
            startTransform();


        }

        window.addEventListener('keydown', (event) => {
            if (!this.selectedObject)
                return;

            if (event.code === "Escape") {
                endTransform(true);
            } else if (event.code === "KeyG") {
                mode = gizmo.mode = 'translate';
                if (!started) {
                    transformAxis = "XYZ";
                    startTransform();
                } else {
                    updateTransform();
                }
            } else if (event.code === "KeyS") {
                mode = gizmo.mode = 'scale';
                if (!started) {
                    transformAxis = "XYZ";
                    startTransform();
                } else {
                    updateTransform();
                }
            } else if (event.code === "KeyR") {
                mode = gizmo.mode = 'rotate';
                if (!started) {
                    transformAxis = "XYZ";
                    startTransform();
                } else {
                    updateTransform();
                }
            } else if (event.code === "ControlLeft" || event.code === "ControlRight") {
                if (!ctrlPressed) {
                    ctrlPressed = true;
                    updateTransform();
                }
            } else if (started) {
                let newTransformAxis = null;

                switch (event.code) {
                    case "KeyX": {
                        newTransformAxis = event.shiftKey ? "YZ" : "X";
                        break;
                    }
                    case "KeyY": {
                        newTransformAxis = event.shiftKey ? "XZ" : "Y";
                        break;
                    }
                    case "KeyZ": {
                        newTransformAxis = event.shiftKey ? "XY" : "Z";
                        break;
                    }
                    case "KeyX":
                    case "KeyY":
                    case "KeyZ":
                        break;
                }

                if (newTransformAxis && newTransformAxis !== transformAxis) {
                    transformAxis = newTransformAxis;
                    updateTransform();
                }
            } else if (event.code === 'KeyD' && event.shiftKey) {
                this.dispatchEvent({ type: 'makeDuplicate' });
            }
        });

        window.addEventListener('keyup', (event) => {
            if (!this.selectedObject)
                return;

            if (event.code === "ControlLeft" || event.code === "ControlRight") {
                ctrlPressed = false;
                updateTransform();
            }
        });
    }
}

class PlaneRaycastDebug extends THREE.Object3D {
    constructor({ planeColor, intersectionColor, rayColor }) {
        super();

        this.debugPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20, 10, 10),
            new THREE.MeshBasicMaterial({ visible: true, wireframe: true, color: planeColor, side: THREE.DoubleSide, transparent: true, opacity: 0.3 })
        );

        this.debugLine = new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints([]),
            new THREE.MeshBasicMaterial({ color: rayColor })
        );

        this.debugPoint = new THREE.Mesh(
            new THREE.SphereGeometry(0.03),
            new THREE.MeshBasicMaterial({ color: intersectionColor })
        );

        this.add(this.debugPlane, this.debugLine, this.debugPoint);

        this.update();
    }

    update(plane, line, intersection) {
        this.updatePlane(plane);
        this.updateLine(line);
        this.updatePoint(intersection);
    }

    updatePlane(plane) {
        const { debugPlane } = this;

        debugPlane.visible = !!plane;

        if (plane) {
            debugPlane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), plane.normal);
            plane.position && debugPlane.position.copy(plane.position);
        }
    }

    updateLine(line) {
        const { debugLine } = this;

        debugLine.visible = !!line;

        if (line) {
            debugLine.geometry.setFromPoints([
                line.start,
                line.end
            ]);
        }
    }

    updatePoint(point) {
        const { debugPoint } = this;

        debugPoint.visible = !!point;

        if (point) {
            debugPoint.position.copy(point);
        }
    }
}


class TorusDebugger extends THREE.Object3D {
    constructor() {
        super();
        // planeColor: 0xf0dc43, intersectionColor: 0xa92ff5, rayColor: 0x5f90fa });
        // planeColor: 0xf04343, intersectionColor: 0x2fe8f5, rayColor: 0x5ffa64 });

        const torusParams = new THREE.Vector2(0.5, 0.01);

        const torusX = this.createTorus(torusParams, X_AXIS_COLOR);

        torusX.onBeforeRender = (_, __, camera) => {
            const cameraNormal = new THREE.Vector3().copy(camera.position).sub(torusX.position).normalize();

            torusX.rotation.set(
                Math.atan2(cameraNormal.z, cameraNormal.y),
                THREE.MathUtils.degToRad(90),
                0
            );
        }


        const torusY = this.createTorus(torusParams, Y_AXIS_COLOR);

        torusY.onBeforeRender = (_, __, camera) => {
            const cameraNormal = new THREE.Vector3().copy(camera.position).sub(torusY.position).normalize();

            torusY.rotation.set(
                THREE.MathUtils.degToRad(90),
                Math.atan2(cameraNormal.x, cameraNormal.z),
                0,
                "YXZ"
            );
        }

        const torusZ = this.createTorus(torusParams, Z_AXIS_COLOR);

        torusZ.onBeforeRender = (_, __, camera) => {
            const cameraNormal = new THREE.Vector3().copy(camera.position).sub(torusZ.position).normalize();

            torusZ.rotation.set(
                0,
                0,
                Math.atan2(-cameraNormal.x, cameraNormal.y)
            );


        }

        this.add(torusX, torusY, torusZ);

    }

    intersectRayTorus(rayOrigin, rayDirection, torusParams) {
        const majorRadius = torusParams.x;  // Major radius of the torus
        const minorRadius = torusParams.y;  // Minor radius of the torus

        const q = rayOrigin.clone();
        const d = rayDirection.clone();

        const a = d.x * d.x + d.y * d.y + d.z * d.z - minorRadius * minorRadius;
        const b = 2.0 * (q.x * d.x + q.y * d.y + q.z * d.z);
        const c = q.x * q.x + q.y * q.y + q.z * q.z - majorRadius * majorRadius - minorRadius * minorRadius;

        const discriminant = b * b - 4.0 * a * c;

        if (discriminant < 0.0) {
            // No intersection
            return { hit: false, t: null };
        }

        const sqrtDiscriminant = Math.sqrt(discriminant);
        const t1 = (-b - sqrtDiscriminant) / (2.0 * a);
        const t2 = (-b + sqrtDiscriminant) / (2.0 * a);

        // Find the closest intersection point in front of the ray
        const t = Math.min(t1, t2);

        // Check if the intersection point is within the bounds of the torus
        const intersectionPoint = q.clone().add(d.clone().multiplyScalar(t));

        const distanceToCenter = Math.sqrt(intersectionPoint.x * intersectionPoint.x + intersectionPoint.y * intersectionPoint.y);

        const torusRadiusBig = majorRadius;
        const torusRadiusSmall = majorRadius - minorRadius;

        const hit = distanceToCenter > torusRadiusSmall && distanceToCenter < torusRadiusBig;

        return { hit, t, t1, t2 };
    }

    intersectRaySphere(rayOrigin, rayDirection, sphereRadius) {
        const a = rayDirection.dot(rayDirection);
        const b = 2.0 * rayDirection.dot(rayOrigin);
        const c = rayOrigin.dot(rayOrigin) - sphereRadius * sphereRadius;

        const discriminant = b * b - 4.0 * a * c;

        if (discriminant < 0.0) {
            // No intersection
            return { hit: false, t: null };
        }

        const sqrtDiscriminant = Math.sqrt(discriminant);

        const t1 = (-b - sqrtDiscriminant) / (2.0 * a);
        const t2 = (-b + sqrtDiscriminant) / (2.0 * a);

        // Find the closest intersection point in front of the ray
        const t = Math.min(t1, t2);

        // Check if the intersection point is in front of the ray
        // if (t < 0.0) {
        //     return { hit: false, t: null };
        // }

        return { hit: true, t };
    }

    createTorus(torusParams, color) {
        const torusGeom = new THREE.TorusGeometry(torusParams.x, torusParams.y, 30, 100, THREE.MathUtils.degToRad(180));
        const torusMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });

        return new THREE.Mesh(torusGeom, torusMat);
    }

    createSphere(radius) {
        const geom = new THREE.SphereGeometry(radius);
        const mat = new THREE.MeshBasicMaterial({ color: 0xf04343 });

        return new THREE.Mesh(geom, mat);
    }

    addLine(a, b, color) {
        const l = new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints([]),
            new THREE.MeshBasicMaterial({ color })
        );

        l.geometry.setFromPoints([a, b]);

        this.add(l);

        return l;
    }

    addPoint(point, color, size = 0.1) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(size, 2, 2),
            new THREE.MeshBasicMaterial({ color })
        );

        mesh.position.copy(point);

        this.add(mesh);

        return mesh;
    }
}
