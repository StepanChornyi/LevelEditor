export function isPointerLocked(domElement) {
    return document.pointerLockElement === domElement ||
        document.mozPointerLockElement === domElement ||
        document.webkitPointerLockElement === domElement;
}

export function requestPointerLock(domElement) {
    domElement.requestPointerLock = domElement.requestPointerLock ||
        domElement.mozRequestPointerLock ||
        domElement.webkitRequestPointerLock;

    domElement.requestPointerLock()
}

export function exitPointerLock() {
    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;

    document.exitPointerLock();
}