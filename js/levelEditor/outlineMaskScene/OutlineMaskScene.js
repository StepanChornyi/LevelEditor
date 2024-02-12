import * as THREE from 'three';

import OutlineStencilMask from './outlineStencilMask/OutlineStencilMask';

export default class OutlineMaskScene extends THREE.Scene {
    constructor() {
        super();

        this.init();
    }

    init() {
        const plane1 = this.plane1 = new OutlineStencilMask(0xff0000);
        const plane2 = this.plane2 = new OutlineStencilMask(0x00ff00);

        plane1.material.stencilWrite = true;
        plane1.material.stencilFunc = THREE.EqualStencilFunc;
        plane1.material.stencilFail = THREE.KeepStencilOp;
        plane1.material.stencilZFail = THREE.KeepStencilOp;
        plane1.material.stencilZPass = THREE.KeepStencilOp;
        plane1.material.stencilRef = 0b01;
        plane1.material.stencilFuncMask = 0b01;
        plane1.material.stencilWriteMask = 0xff;

        plane2.material.stencilWrite = true;
        plane2.material.stencilFunc = THREE.EqualStencilFunc;
        plane2.material.stencilFail = THREE.KeepStencilOp;
        plane2.material.stencilZFail = THREE.KeepStencilOp;
        plane2.material.stencilZPass = THREE.KeepStencilOp;
        plane2.material.stencilRef = 0b10;
        plane2.material.stencilFuncMask = 0b10;
        plane2.material.stencilWriteMask = 0xff;

        plane1.renderOrder = 1;
        plane2.renderOrder = 2;

        this.add(plane1);
        this.add(plane2);
    }

    setOutline(mesh, val) {
        mesh.material.stencilWrite = true;

        if (val) {
            mesh.material.stencilFunc = THREE.AlwaysStencilFunc;
            mesh.material.stencilFail = THREE.ReplaceStencilOp;
            mesh.material.stencilZFail = THREE.KeepStencilOp;
            mesh.material.stencilZPass = THREE.ReplaceStencilOp;
            mesh.material.stencilRef = 0b01;
            // mesh.material.stencilFuncMask = 0xff;
            mesh.material.stencilWriteMask = 0b01;
            mesh.renderOrder = -2;
        } else {
            mesh.material.stencilFunc = THREE.AlwaysStencilFunc;
            mesh.material.stencilFail = THREE.ReplaceStencilOp;
            mesh.material.stencilZFail = THREE.KeepStencilOp;
            mesh.material.stencilZPass = THREE.ReplaceStencilOp;
            mesh.material.stencilRef = 0b10;
            mesh.material.stencilFuncMask = 0b11;
            mesh.material.stencilWriteMask = 0b10;
            mesh.renderOrder = -1;
        }
    }
}