precision mediump float;

varying vec2 fragUv;

uniform float opacity;

void main() {
    float dist = distance(fragUv, vec2(0.5));
    float alpha = 0.0;
    float size = 0.15;

    if(dist > (0.5 - size) && dist < 0.5) {
        float t = ((dist - (0.5 - size)) / size);
        float PI = 3.14159265358;

        alpha = (cos(t * PI * 2.0) * -1.0 + 1.0) * 0.5;
    }

    gl_FragColor = vec4(vec3(1.0), alpha * opacity);
}