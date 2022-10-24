export default /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPos;


void main() {
// vPos = position;
vec3 Pos = position;
vec4 modelPosition = modelMatrix * vec4(Pos, 1.0);
vPos = modelPosition;
vec4 ViewPosition = viewMatrix * modelPosition;
vec4 ProjectedPosition = projectionMatrix * ViewPosition;
gl_Position = ProjectedPosition;
vUv = uv;
vNormal = normal;
}
`;
