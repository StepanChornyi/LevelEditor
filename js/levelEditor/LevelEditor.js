import * as THREE from 'three';

import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';

// import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { isPointerLocked, requestPointerLock } from '../old/PinterLock';
import EditorGrid from './editorGrid/EditorGrid';

import FullscreenOutlinePlane from './fullscreenPlane/FullscreenOutlinePlane';
import MeshEditorMaterial from './meshEditorMaterial/MeshEditorMaterial';
import SelectionArea from './selectionArea/SelectionArea';
import FullscreenCopyPlane from './fullscreenPlane/FullscreenCopyPlane';
import OutlineMaskScene from './outlineMaskScene/OutlineMaskScene';
import SelectController from './SelectController';
import TransformController from './TransfrormController';

export default class LevelEditor {
    constructor() {

        this.init();
    }

    init() {
        const renderer = this.renderer = new WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true, stencil: false });

        renderer.autoClear = false;
        renderer.autoClearColor = false;
        renderer.autoClearDepth = false;
        renderer.autoClearStencil = false;

        document.getElementById("container").appendChild(renderer.domElement);

        const camera = this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

        camera.position.z = 3;
        camera.position.x = 0;
        camera.position.y = 1;

        camera.lookAt(0, 0, 0);

        const scene = this.scene = new THREE.Scene();
        const objectsScene = this.objectsScene = new THREE.Scene();

        const targetMain = this.targetMain = new THREE.WebGLRenderTarget(10, 10, { depthBuffer: true, stencilBuffer: true });

        targetMain.depthTexture = new THREE.DepthTexture(10, 10)
        targetMain.depthTexture.format = THREE.DepthStencilFormat;
        targetMain.depthTexture.type = THREE.UnsignedInt248Type;

        this.outlineMaskScene = new OutlineMaskScene();
        this.copyObjectsScene = new THREE.Scene().add(new FullscreenCopyPlane(targetMain.texture, targetMain.depthTexture));

        const geometry = new THREE.BoxGeometry(1, 1, 1);

        for (let i = 0; i < 600; i++) {
            const cube2 = this.cube2 = new THREE.Mesh(geometry, new MeshEditorMaterial());

            this.outlineMaskScene.setOutline(cube2, false);

            cube2.position.x = -100 + 200 * Math.random();
            cube2.position.z = -100 + 200 * Math.random();

            objectsScene.add(cube2)
        }

        const grid = this.grid = new EditorGrid();
        const outlineMesh = this.outlineMesh = new FullscreenOutlinePlane(targetMain.texture);
        const selectionArea = this.selectionArea = new SelectionArea();

        outlineMesh.renderOrder = 1;
        selectionArea.renderOrder = 2;
        selectionArea.visible = false;

        scene.add(grid, outlineMesh, selectionArea);

        /////////////////
        const transformController = this.transformController = new TransformController(scene, camera);

        transformController.addEventListener('transformStart', () => {
            selectController.enabled = false;
            outlineMesh.setIsPressed(true);

        });

        transformController.addEventListener('transformEnd', () => {
            selectController.enabled = true;
            outlineMesh.setIsPressed(false);
        });

        transformController.addEventListener('makeDuplicate', () => {
            const cloned = transformController.selected.clone();

            cloned.material = new MeshEditorMaterial();

            objectsScene.add(cloned);
            selectController.setSelection([cloned]);
            transformController.transformObject(cloned);
        });

        ///////////////////
        const selectController = new SelectController(renderer, objectsScene, camera);

        selectController.addEventListener('updateSelectionArea', ({ centerX, centerY, width, height }) => {
            selectionArea.visible = true;
            selectionArea.setRect(centerX, centerY, width, height);
        });

        selectController.addEventListener('resetSelect', () => {
            selectionArea.visible = false;
            // transformAxisGuide.visible = false;

            transformController.selected = null;

            // transformController.selectedObject = null;
            for (let i = 0; i < selectController.scene.children.length; i++) {
                const child = selectController.scene.children[i];

                this.outlineMaskScene.setOutline(child, false);
            }
        });

        selectController.addEventListener('objectsSelected', () => {
            transformController.selected = selectController.selectedObjects[0];

            for (let i = 0; i < selectController.selectedObjects.length; i++) {
                const child = selectController.selectedObjects[i];

                this.outlineMaskScene.setOutline(child, true);

                // this.gizmo.position.copy(child.position)
                // transformAxisGuide.position.copy(child.position)
            }
        });


        // const transformControls = this.transformControls = new TransformControls(camera, renderer.domElement)
        // transformControls.attach(this.cube2)
        // scene.add(transformControls)

        const orbitControls = this.orbitControls = new OrbitControls(camera, renderer.domElement);

        orbitControls.mouseButtons = {
            LEFT: null,
            MIDDLE: THREE.MOUSE.ROTATE,
            RIGHT: THREE.MOUSE.PAN
        }

        orbitControls.update();


        // const light = new THREE.AmbientLight(0xffffff, 0.1); // soft white light
        // scene.add(light);

        // const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        // scene.add(directionalLight);

        // directionalLight.position.set(3, 10, 0);
        // directionalLight.target = new THREE.Object3D();

        window.addEventListener('resize', this.onResize.bind(this), false);

        this.onResize();
    }

    update(dt, currentTime) {
        this.currentTime = currentTime;

        const { camera, renderer } = this;

        this.grid.setTarget(this.orbitControls.target);
        this.grid.setCamera(camera);

        this.transformController.gizmo.updateScale(camera);

        this.orbitControls.update();

        renderer.setRenderTarget(this.targetMain);
        renderer.setClearColor(0x808080, 1)
        renderer.clear();
        renderer.render(this.objectsScene, camera);

        renderer.setRenderTarget(null);
        renderer.setClearColor(0, 0);
        renderer.clear();
        renderer.render(this.copyObjectsScene, camera);

        renderer.setRenderTarget(this.targetMain);
        renderer.setClearColor(0, 0);
        renderer.clearColor();
        renderer.render(this.outlineMaskScene, camera);

        renderer.setRenderTarget(null);
        renderer.setClearColor(0x303030, 1)
        renderer.render(this.scene, camera);
    }

    onResize() {
        const { camera, renderer } = this;

        const upscale = 1;
        const w = Math.round(window.innerWidth * upscale);
        const h = Math.round(window.innerHeight * upscale);

        camera.aspect = w / h;

        camera.updateProjectionMatrix();

        this.targetMain.setSize(w * 2, h * 2);
        this.selectionArea.setSize(w, h);
        this.outlineMesh.setSize(w, h);

        renderer.setSize(w, h);

        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
    }
}


// function easeInOutSine(x) {
//     return -(Math.cos(Math.PI * x) - 1) / 2;
// }