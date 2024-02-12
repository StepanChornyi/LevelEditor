precision mediump float;

varying vec3 vertPos;
varying float maxDist;

void main() {
    vertPos = position;
    maxDist = length(vertPos);
    maxDist = sqrt((maxDist * maxDist) * 0.5);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}