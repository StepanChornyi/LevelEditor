uniform vec3 color; 

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(color,  0.1);
    // gl_FragDepth = -0.0;
}