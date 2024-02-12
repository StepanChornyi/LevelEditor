varying vec2 fragPos;

void main() {
    fragPos = position.xy;

    gl_Position = vec4(position.xy, 0.0, 1.0);
}