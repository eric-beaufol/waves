// varying vec3 color;
// varying float fPosZ;
// varying vec4 worldPosition;
// uniform float u_time;
// uniform float u_wave1Length;
// uniform float u_wave1Amplitude;
// uniform float u_wave1Speed;
// uniform vec2 u_wave1Dir;
// uniform float u_wave2Length;
// uniform float u_wave2Amplitude;
// uniform float u_wave2Speed;
// uniform vec2 u_wave2Dir;
// uniform float u_wave3Length;
// uniform float u_wave3Amplitude;
// uniform float u_wave3Speed;
// uniform vec2 u_wave3Dir;
// uniform float u_peak;
// uniform float u_waveFrequency;
// uniform float u_waveSpeed;
// uniform float u_waveHeight;

// varying vec3 vViewPosition;
// varying vec3 vNormal;

// void main() {
//   vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
//   worldPosition = modelMatrix * vec4(position, 1.0);

//   vViewPosition = modelViewPosition.xyz;
//   vNormal = normalMatrix * normal;
  
//   modelViewPosition.y += 2. * u_wave1Amplitude * u_waveHeight * pow(
//     (
//       sin(
//         dot(u_wave1Dir, worldPosition.xz) * 
//         (2. / u_wave1Length) * 
//         u_waveFrequency + 
//         u_time * 
//         u_wave1Speed * 
//         (2. * 2./u_wave1Length) * 
//         u_waveSpeed
//       ) + 1.) / 2.,
//     u_peak
//   );

//   modelViewPosition.y += 2. * u_wave2Amplitude * u_waveHeight * pow(
//     (
//       sin(
//         dot(u_wave2Dir, worldPosition.xz) * 
//         (2. / u_wave2Length) * 
//         u_waveFrequency + 
//         u_time * 
//         u_wave2Speed * 
//         (2. * 2./u_wave2Length) * 
//         u_waveSpeed
//       ) + 1.) / 2.,
//     u_peak
//   );

//   modelViewPosition.y += 2. * u_wave3Amplitude * u_waveHeight * pow(
//     (
//       sin(
//         dot(u_wave3Dir, worldPosition.xz) * 
//         (2. / u_wave3Length) * 
//         u_waveFrequency + 
//         u_time * 
//         u_wave3Speed * 
//         (2. * 2./u_wave3Length) * 
//         u_waveSpeed
//       ) + 1.) / 2.,
//     u_peak
//   );
  
//   fPosZ = sin(u_time + worldPosition.x + worldPosition.z) * 2.5;

//   gl_Position = projectionMatrix * modelViewPosition;
// }

#define PHONG

varying vec3 vViewPosition;
varying float fPosZ;
varying vec4 worldPosition;
uniform float u_time;
uniform float u_wave1Length;
uniform float u_wave1Amplitude;
uniform float u_wave1Speed;
uniform vec2 u_wave1Dir;
uniform float u_wave2Length;
uniform float u_wave2Amplitude;
uniform float u_wave2Speed;
uniform vec2 u_wave2Dir;
uniform float u_wave3Length;
uniform float u_wave3Amplitude;
uniform float u_wave3Speed;
uniform vec2 u_wave3Dir;
uniform float u_peak;
uniform float u_waveFrequency;
uniform float u_waveSpeed;
uniform float u_waveHeight;
varying vec3 vNormal;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

// #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

// 	vNormal = normalize( transformedNormal );

// #endif

  vNormal = normalize(vec3(1., 0., 0.));

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>

  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  worldPosition = modelMatrix * vec4(position, 1.0);

  float frequency1 = (2. / u_wave1Length) * u_waveFrequency;
  float amplitude1 = 2. * u_wave1Amplitude * u_waveHeight;
  float speed1 = u_wave1Speed * frequency1 * u_waveSpeed;

  float wave1Expression = (sin(dot(u_wave1Dir, worldPosition.xz) * frequency1 + u_time * speed1) + 1.) / 2.;

  modelViewPosition.y += amplitude1 * pow(wave1Expression, u_peak);

  // float wave2Expression = (
  //   sin(
  //     dot(u_wave2Dir, worldPosition.xz) * 
  //     (2. / u_wave2Length) * 
  //     u_waveFrequency + 
  //     u_time * 
  //     u_wave2Speed * 
  //     (2. * 2./u_wave2Length) * 
  //     u_waveSpeed
  //   ) + 1.) / 2.;

  // modelViewPosition.y += 2. * u_wave2Amplitude * u_waveHeight * pow(wave2Expression, u_peak);

  // float wave3Expression = (
  //   sin(
  //     dot(u_wave3Dir, worldPosition.xz) * 
  //     (2. / u_wave3Length) * 
  //     u_waveFrequency + 
  //     u_time * 
  //     u_wave3Speed * 
  //     (2. * 2./u_wave3Length) * 
  //     u_waveSpeed) + 1.) / 2.;

  // modelViewPosition.y += 2. * u_wave3Amplitude * u_waveHeight * pow(wave3Expression, u_peak);

  float dX = u_peak * u_wave1Dir.x * modelViewPosition.x * u_wave1Amplitude * u_waveHeight * pow(wave1Expression, u_peak - 1.) * 
    cos(dot(u_wave1Dir, worldPosition.xz) * (2. / u_wave1Length) + u_time * u_wave1Speed * (2. * 2./u_wave1Length) * u_waveSpeed);
  float dY = u_peak * u_wave1Dir.y * modelViewPosition.z * u_wave1Amplitude * u_waveHeight * pow(wave1Expression, u_peak - 1.) * 
    cos(dot(u_wave1Dir, worldPosition.xz) * (2. / u_wave1Length) + u_time * u_wave1Speed * (2. * 2./u_wave1Length) * u_waveSpeed);

  objectNormal += vec3(dX, dY, 1.);
  // objectNormal = vec3(1., 1., 1.);
  // transformedNormal = normalMatrix * objectNormal;
  transformedNormal = normalMatrix * objectNormal;
  // vNormal = normalize(transformedNormal);
  vNormal = normalize(transformedNormal);

  // vNormal = u_peak * u_wave1Dir.x * modelViewPosition.y * u_wave1Amplitude * u_waveHeight * pow(wave1Expression, u_peak - 1.) * 
  //   cos(dot(u_wave1Dir, worldPosition.xz) * (2. / u_wave1Length) + u_time * u_wave1Speed * (2. * 2./u_wave1Length) * u_waveSpeed);

  gl_Position = projectionMatrix * modelViewPosition;
  
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
