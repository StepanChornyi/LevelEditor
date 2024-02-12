import * as THREE from 'three';

export default class SelectController extends THREE.EventDispatcher {
    constructor(renderer, scene, camera) {
        super();

        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;

        this.selectedObjects = [];
        this.enabled = true;
        this.isPressed = false;

        this.init();

        setTimeout(() => this.dispatchEvent({ type: 'resetSelect' }));
    }

    setSelection(objects){
        this.dispatchEvent({ type: 'resetSelect' });
        this.selectedObjects = objects;
        this.dispatchEvent({ type: 'objectsSelected' });
    }

    init() {
        const raycaster = new THREE.Raycaster();
        const pointerPressPos = new THREE.Vector2();
        const pointerReleasePos = new THREE.Vector2();

        const onPointerDown = (event) => {
            if (event.button !== 0 || !this.enabled)
                return;

            pointerPressPos.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointerPressPos.y = - (event.clientY / window.innerHeight) * 2 + 1;

            this.isPressed = true;
        }

        const onPointerMove = (event) => {
            if (!this.isPressed)
                return;

            pointerReleasePos.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointerReleasePos.y = - (event.clientY / window.innerHeight) * 2 + 1;

            const centerX = (pointerPressPos.x + pointerReleasePos.x) * 0.5;
            const centerY = (pointerPressPos.y + pointerReleasePos.y) * 0.5;
            const width = Math.abs(pointerPressPos.x - pointerReleasePos.x);
            const height = Math.abs(pointerPressPos.y - pointerReleasePos.y);

            this.dispatchEvent({ type: 'updateSelectionArea', centerX, centerY, width, height });
        }

        const onPointerUp = (event) => {
            if (!this.isPressed || event.button !== 0)
                return;

            this.isPressed = false;

            this.selectedObjects = [];
            this.dispatchEvent({ type: 'resetSelect' });

            pointerReleasePos.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointerReleasePos.y = - (event.clientY / window.innerHeight) * 2 + 1;

            if (
                Math.abs(pointerReleasePos.x - pointerPressPos.x) * window.innerWidth * 0.5 < 3 &&
                Math.abs(pointerReleasePos.y - pointerPressPos.y) * window.innerHeight * 0.5 < 3
            ) {

                raycaster.setFromCamera(pointerReleasePos, this.camera);

                const intersects = raycaster.intersectObjects(this.scene.children);

                for (let i = 0; i < intersects.length; i++) {
                    const obj = intersects[i].object;

                    this.selectedObjects.push(obj);
                    break;
                }

            } else {
                const centerX = (pointerPressPos.x + pointerReleasePos.x) * 0.5;
                const centerY = (pointerPressPos.y + pointerReleasePos.y) * 0.5;
                const width = Math.abs(pointerPressPos.x - pointerReleasePos.x);
                const height = Math.abs(pointerPressPos.y - pointerReleasePos.y);

                for (let i = 0; i < this.scene.children.length; i++) {
                    const child = this.scene.children[i];

                    const vector = new THREE.Vector3();

                    vector.setFromMatrixPosition(child.matrixWorld);
                    vector.project(this.camera);

                    if (
                        vector.z <= 1 &&
                        Math.abs(vector.x - centerX) < width * 0.5 &&
                        Math.abs(vector.y - centerY) < height * 0.5
                    ) {
                        this.selectedObjects.push(child);
                    }
                }
            }

            if (this.selectedObjects.length)
                this.dispatchEvent({ type: 'objectsSelected' });
        }

        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    }
}