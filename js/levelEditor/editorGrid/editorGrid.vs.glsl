uniform vec3 colorX;
uniform vec3 colorY;
uniform vec3 colorZ;
uniform vec3 cameraOrigin;
uniform float gridType;

varying vec2 fragPos2d;
varying vec3 fragPos3D;
varying vec3 cameraPos3D;
varying vec3 colorA;
varying vec3 colorB;
varying float cameraDist;

void main() {
    fragPos3D = (modelMatrix * vec4(position, 1.0)).xyz;

    cameraPos3D = cameraPosition;

    cameraDist = distance(cameraOrigin, cameraPosition.xyz);

    if(gridType < 0.5) {
        fragPos2d = fragPos3D.xz;
        colorA = colorX;
        colorB = colorZ;
    } else if(gridType < 1.5) {
        fragPos2d = fragPos3D.xy;
        colorA = colorX;
        colorB = colorY;
    } else {
        fragPos2d = fragPos3D.yz;
        colorA = colorY;
        colorB = colorZ;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}