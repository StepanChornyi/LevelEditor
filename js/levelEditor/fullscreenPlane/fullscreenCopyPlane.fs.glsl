uniform sampler2D colorTexture;
uniform sampler2D depthTexture;

varying vec2 vUv;

void main() {
    float depthVal = texture2D(depthTexture, vUv).x;

    gl_FragColor = texture2D(colorTexture, vUv);
    gl_FragDepth = depthVal;
}