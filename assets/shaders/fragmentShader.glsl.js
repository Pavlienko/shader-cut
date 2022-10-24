export default /* glsl */ `

varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPos;
uniform vec2 cubePos;
uniform float uTime;
uniform sampler2D uTexture;

void main(){
    vec3 color = vPos.xyz ;
    vec2 cubePosition = cubePos;
    float cubeWidth = abs(sin(uTime)) + 2.;


    if(color.x < (cubePosition.x + cubeWidth/2.) && color.x > (cubePosition.x - cubeWidth/2.) && color.z < (cubePosition.y + cubeWidth/2.) && color.z > (cubePosition.y - cubeWidth/2.))
    discard;
    vec4 texColor = texture2D(uTexture, vUv);
    color = normalize(vNormal)*0.5+0.5;
    texColor = vec4(texColor.xyz * color,texColor.w);
    // texColor = vec4(texColor.xy * vUv,texColor.zw);
    gl_FragColor = texColor;
}`;
