varying vec2 fragPos;

uniform vec2 textureSize;
uniform vec4 rect;

void main() {
    vec2 coord = (fragPos * vec2(1.0, -1.0) + vec2(1.0)) * 0.5 * textureSize;
    vec2 rectPos = (rect.xy * vec2(1.0, -1.0) + vec2(1.0)) * 0.5 * textureSize;
    vec2 rectSize = rect.zw * 0.5 * textureSize;
    vec2 distance = abs(fragPos - rect.xy) * textureSize;

    if(distance.x < rectSize.x && distance.y < rectSize.y) {
        vec2 distToBorderSigned = distance - rectSize;
        vec2 distToBorder = abs(distToBorderSigned);

        bvec2 isBorder = bvec2(distToBorder.x < 2.0, distToBorder.y < 2.0);

        vec2 dashOffsset = vec2(coord.x - (rectPos.x - rectSize.x * 0.5), (rectPos.y + rectSize.y * 0.5) - coord.y);

        if(rectPos.y < coord.y) {
            dashOffsset.x = rectSize.x - dashOffsset.x;
        }

        if(rectPos.x < coord.x) {
            dashOffsset.y = rectSize.y - dashOffsset.y;
        }

        vec2 dashMod = mod(dashOffsset, 6.0);

        bool isDashX = dashMod.y < 3.0;
        bool isDashY = dashMod.x < 3.0;

        if((!isDashX && isBorder.x) || (!isDashY && isBorder.y)) {
            gl_FragColor = vec4(vec3(1.0), 0.7);
            return;
        }

        gl_FragColor = vec4(vec3(0.8), 0.3);
    } else {
        discard;
    }
}