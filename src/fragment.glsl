uniform vec3 colorA; 
uniform vec3 colorB; 
varying vec3 vUv;
varying float fPosZ;

void main() {
  gl_FragColor = vec4(mix(colorA, colorB, fPosZ), 1.0);
}