import * as THREE from 'three';

import vertexShader from "./gizmoDisc.vs.glsl";
import fragmentShader from "./gizmoDisc.fs.glsl";

export default class GizmoDisc extends THREE.Object3D {
    constructor(radius, fillColor, lineColor, faceToCamera = false, interSectRadius = radius) {
        super();

        this.faceToCamera = faceToCamera;
        this.radius = radius;
        this.interSectRadius = interSectRadius;

        this._opacity = {
            default: 0.8,
            hover: 0.9
        };

        const size = radius * 2;
        const geom = new THREE.PlaneGeometry(size, size);

        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader, uniforms: {
                opacity: { value: 0.8 },
                color: { value: intColorToVec3(fillColor) },
                isSector: { value: true },
                rotateAngle: { value: 0.0 },
            },
        });

        material.alphaToCoverage = true;
        material.transparent = true;
        material.side = THREE.DoubleSide;
        material.depthTest = false;

        const debugMaterial = new THREE.Mesh(geom, new THREE.MeshDepthMaterial({ color: fillColor, wireframe: true }));

        const disc = this.disc = new THREE.Mesh(geom, material || debugMaterial);

        disc.onBeforeRender = (...args) => this.onBeforeRender(...args);

        const lineThick = this.lineThick = this.createLine(radius, 0.015, lineColor);
        const lineThin = this.lineThin = this.createLine(radius, 0.005, lineColor);

        const wrapper = this.wrapper = new THREE.Object3D();

        wrapper.add(disc, lineThick, lineThin);

        this.add(wrapper);

        this.angleAdjustment = 0;

        this.setSector(null);
    }

    adjustTo(worldPoint) {
        if (!worldPoint) {
            this.wrapper.rotation.z = 0;
            return;
        }

        const localPoint = this.worldToLocal(worldPoint);

        const angle = Math.atan2(-localPoint.x, localPoint.y);

        this.wrapper.rotation.z = angle;
    }

    createLine(length, thickness, color, segments = 10) {
        const wrapper = new THREE.Object3D();
        const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
        const geom = new THREE.CylinderGeometry(thickness, thickness, length, segments, 1, false);
        const mesh = new THREE.Mesh(geom, mat);

        mesh.position.y += length * 0.5;

        wrapper.add(mesh);

        return wrapper;
    }

    intersects(pointer, camera) {
        const raycaster = new THREE.Raycaster();

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects([this.disc]);

        if (!intersects.length)
            return null;

        const local = this.disc.worldToLocal(intersects[0].point);
        const dist = local.length();

        if (dist > this.interSectRadius)
            return null;

        return intersects[0].point;
    }

    onBeforeRender(_, __, camera) {
        if (this.faceToCamera) {
            this.quaternion.copy(camera.quaternion);
            this.updateWorldMatrix();

            // this.rotation.x = 0
        }
    }

    setSector(angle, linesVisible = false) {
        const disc = this.disc;

        if (angle === null) {
            disc.material.uniforms.isSector.value = false;

            linesVisible = false;
        } else {
            this.wrapper.scale.x = Math.sign(-angle);

            disc.material.uniforms.isSector.value = true;
            disc.material.uniforms.rotateAngle.value = Math.abs(angle);

            this.lineThick.rotation.z = Math.abs(angle);
        }

        this.lineThin.visible = this.lineThick.visible = linesVisible;

        return this;
    }

    _updateHover() {
        this.disc.material.uniforms.opacity.value = this._hovered ? this._opacity.hover : this._opacity.default;
    }

    get hovered() {
        return this._hovered;
    }

    set hovered(val) {
        this._hovered = val;
        this._updateHover();
    }

    get opacity() {
        return this._opacity.default;
    }

    set opacity(val) {
        this._opacity.default = val;
        this._updateHover();
    }

    get hoverOpacity() {
        return this._opacity.hover;
    }

    set hoverOpacity(val) {
        this._opacity.hover = val;
        this._updateHover();
    }
}

function intColorToVec3(color) {
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    return new THREE.Vector3(r / 255, g / 255, b / 255);
}