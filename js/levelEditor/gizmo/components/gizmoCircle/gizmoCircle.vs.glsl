precision mediump float;

varying vec2 fragUv;

void main() {
    fragUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}