#include <packing>

uniform sampler2D stencilData;
uniform vec2 textureSize;
uniform vec3 outlineColor;

varying vec2 vUv;

void main() {
    vec4 current = texture2D(stencilData, vUv);
    vec4 resultColor = vec4(outlineColor, 1.0);

    // //debug
    // gl_FragColor = vec4(current.xyz, 1.0);
    // return;

    if(current.x > 0.2) {
        discard;
    } else {
        vec2 scale = vec2(1.0) / textureSize;
        float PI2 = 3.1416 * 2.0;
        vec2 avg = vec2(0.0);
        vec2 radius = 3.0 * scale;

        for(int i = 0; i < 9; i++) {
            float angle = (float(i) / 9.0) * PI2;
            vec2 offset = radius * vec2(sin(angle), cos(angle));

            avg += texture2D(stencilData, vUv + offset).xy;
        }

        avg /= 9.0;

        if(avg.x < 0.2) {
            resultColor.a = avg.x / 0.2;
        } else {
            resultColor.a = 1.0;
        }

        if(avg.y > 0.9) {
            resultColor *= 0.7;
        }

        gl_FragColor = resultColor;
    }
}