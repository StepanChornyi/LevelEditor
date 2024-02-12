uniform sampler2D texture0; 

varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(texture0, vUv);
}