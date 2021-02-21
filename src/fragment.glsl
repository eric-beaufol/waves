// same name and type as VS
varying vec3 vNormal;
uniform vec3 u_emissive;
uniform vec3 u_specular;

void main() {

  // calc the dot product and clamp
  // 0 -> 1 rather than -1 -> 1
  vec3 light = vec3(0., 1., 0.);

  // ensure it's normalized
  light = normalize(light);

  // calculate the dot product of
  // the light to the vertex normal
  // float dProd = 1.0;
  float dProd = max(0.0,dot(vNormal, light));
  vec3 color = u_emissive * dProd;

  // feed into our frag colour
  gl_FragColor = vec4(color, 1.0);

}