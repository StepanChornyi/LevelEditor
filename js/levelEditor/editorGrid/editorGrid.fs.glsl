varying vec2 fragPos2d;
varying vec3 fragPos3D;
varying vec3 colorA;
varying vec3 colorB;
varying float cameraDist;

uniform vec3 cameraOrigin;
uniform float opacity;

vec4 grid(float scale, float fade) {
    vec2 coord = fragPos2d * scale;
    vec2 derivative = fwidth(coord);

    vec2 grid = abs(fract(coord - 0.5) - 0.5) / derivative;

    float line = min(grid.x, grid.y);
    float minimumz = min(derivative.y, 1.0);
    float minimumx = min(derivative.x, 1.0);
    vec4 color = vec4(0.31, 0.31, 0.31, 1.0 - min(line, 1.0));

    float axisThickness = 1.0 / scale;

    // y axis
    if(fragPos2d.x > -axisThickness * minimumx && fragPos2d.x < axisThickness * minimumx)
        color.xyz = colorB;

    // x axis
    if(fragPos2d.y > -axisThickness * minimumz && fragPos2d.y < axisThickness * minimumz)
        color.xyz = colorA;

    color.a *= fade;

    return color;
}

float getFade(float distanceToFrag, float near, float far) {
    return 1.0 - clamp((distanceToFrag - near) / (far - near), 0.0, 1.0);
}

void main() {
    float distanceToFrag = distance(fragPos3D, cameraOrigin);

    vec4 gridSmall = grid(1.0, getFade(distanceToFrag, 10.0, 40.0));
    vec4 gridMedium = grid(0.1, getFade(distanceToFrag, 30.0, 300.0));
    vec4 gridLarge = grid(0.01, getFade(distanceToFrag, 200.0, 600.0));

    float smallGridDist = 8.0;
    float mediumGridDist = 30.0;
    float largeGridDist = 200.0;
    float mixFactor1 = clamp((cameraDist - smallGridDist) / (mediumGridDist - smallGridDist), 0.0, 1.0);
    float mixFactor2 = clamp((cameraDist - mediumGridDist) / (largeGridDist - mediumGridDist), 0.0, 1.0);

    gl_FragColor = mix(gridSmall, mix(gridMedium, gridLarge, mixFactor2), mixFactor1);

    gl_FragColor.a *= opacity;

    // gl_FragColor.a *= 0.3;

    if(gl_FragColor.a < 0.01) {
        discard;
    }
}