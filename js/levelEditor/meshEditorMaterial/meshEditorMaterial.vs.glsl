varying float lightness;

void main() {
    vec3 fragNormal = normalize(normalMatrix * normal);

    lightness = dot(fragNormal, vec3(0.0, 0.0, 1.0));

    lightness = mix(0.5, 1.0, lightness);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}