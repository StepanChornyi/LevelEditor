precision mediump float;

uniform vec3 color;
uniform float opacity;
uniform float rotateAngle;
uniform bool isSector;

varying vec3 vertPos;
varying float maxDist;

float PI = 3.1415926;

void main() {
    float dist = length(vertPos);

    if(dist > maxDist) {
        discard;
        return;
    }

    gl_FragColor = vec4(color, 0.0);

    if(!isSector) {
        gl_FragColor.a = opacity;
        return;
    }

    vec3 polarCoord = normalize(vertPos);

    float currentAngle = atan(-polarCoord.x, polarCoord.y);

    if(currentAngle < 0.0) {
        currentAngle = 2.0 * PI + currentAngle;
    }

    currentAngle = mod(currentAngle, PI * 2.0);

    float fullSpins = floor(rotateAngle / (PI * 2.0));
    float spinAngle = rotateAngle - fullSpins * (PI * 2.0);

    // gl_FragColor = vec4(vec3(abs(currentAngle / (PI * 2.0))), 1.0);
    // return;

    if(fullSpins > 0.0) {
        if(fullSpins < 1.5) {
            gl_FragColor.a = 0.5;
        } else {
            gl_FragColor.a = 0.5 + 0.15 * (fullSpins - 1.0);
        }
    }

    if(currentAngle > 0.0 && currentAngle < spinAngle) {
        if(fullSpins < 1.0) {
            gl_FragColor.a += 0.5;
        } else {
            gl_FragColor.a += 0.15;
        }
    }
}