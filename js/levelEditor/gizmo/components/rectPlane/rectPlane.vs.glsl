precision mediump float;

varying vec2 fragUv;
varying float fragDot;

vec3 mutriplyByModel(vec3 pos) {
    return (modelMatrix * vec4(pos, 1.0)).xyz;
}

void main() {
    fragUv = uv;

    vec3 cameraNormal = normalize(cameraPosition - mutriplyByModel(position));
    vec3 viewNormal = mutriplyByModel(normal) - mutriplyByModel(vec3(0));

    fragDot = abs(dot(cameraNormal, viewNormal));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}