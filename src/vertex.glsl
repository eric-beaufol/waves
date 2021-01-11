varying vec3 vUv;
varying float fPosZ;
uniform float u_time;

void main() {
  vUv = position;

  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  modelViewPosition.y += sin(u_time + position.x + position.y) * .5;
  fPosZ = sin(u_time + position.x + position.y) * 2.5;

  gl_Position = projectionMatrix * modelViewPosition;
}