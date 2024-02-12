precision mediump float;

uniform vec3 color;
uniform float strokeSize;
uniform float opacity;

varying vec2 fragUv;
varying float fragDot;

void main() {
    float dist = max(abs(0.5 - fragUv.x), abs(0.5 - fragUv.y)) * 2.0;
    float alpha = 1.0;
    float dotFactor = 1.0;

    if(dist < (1.0 - strokeSize)) {
        alpha = 0.6;
    } else {
        float edgeT = (dist - 1.0 + strokeSize) / strokeSize;

        alpha = 0.7 + 0.3 * edgeT * edgeT;
    }

    if(fragDot < 0.25 && opacity < 0.95) {
        dotFactor = max(0.0, mix(-1.0, 1.0, fragDot / 0.25));
    }

    gl_FragColor = vec4(color, alpha * dotFactor * opacity);
}