import * as THREE from 'three';

import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader';
//#DEV_START 

import floorTextureURL from "../assets/floor_texture.jpg";
//#DEV_END
const textureLoader = new THREE.TextureLoader();
const glbLoader = new GLTFLoader();

export default class Preloader {
    constructor(onLoadCompleted) {
        this.onLoadCompleted = onLoadCompleted;
        this.loadedCount = 0;
        this.assetsToLoad = ["platform_0", "platform_1", "Soldier"];

        this.load();
    }

    load() {
        textureLoader.load(
            floorTextureURL,
            function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                THREE.Cache.files["floorTexture"] = texture;
            },
            undefined,
            function (error) {
                console.error('An error happened.', error);
            }
        );

        for (let i = 0; i < this.assetsToLoad.length; i++) {
            const assetName = this.assetsToLoad[i];
            const path = `blender/${assetName}.glb`;

            glbLoader.load(
                path,
                (gltf) => {
                    THREE.Cache.files[assetName] = gltf;

                    this.onAssetLoaded();
                },
                undefined,
                (error) => {
                    console.error(`${path} not loaded`, error);
                    this.onAssetLoaded();
                }
            );
        }
    }

    onAssetLoaded() {
        this.loadedCount++;

        if (this.loadedCount === this.assetsToLoad.length) {
            this.onLoadCompleted();
        }
    }
}