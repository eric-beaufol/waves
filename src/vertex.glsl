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
varying vec4 worldPosition;

void getWaveHeight(float amplitude, float waveLength, vec2 dir, float speed, vec2 position, inout vec3 normal, inout vec4 modelViewPosition) {
  float frequency = (2. / waveLength) * u_waveFrequency;
  float waveAmplitude = amplitude * u_waveHeight;
  float waveSpeed = speed * frequency * u_waveSpeed;
  float expression = (sin(dot(dir, position.xy) * frequency + u_time * waveSpeed) + 1.) / 2.;
  float height = 2. * waveAmplitude * pow(expression, u_peak);

  float dX = u_peak * dir.x * frequency * waveAmplitude * pow(expression, u_peak - 1.) * cos(dot(dir, position.xy) * frequency + u_time * waveSpeed);
  float dY = u_peak * dir.y * frequency * waveAmplitude * pow(expression, u_peak - 1.) * cos(dot(dir, position.xy) * frequency + u_time * waveSpeed);

  normal.x += dX;
  normal.z += dY;

  modelViewPosition.y += height;
}

void main() {

  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  getWaveHeight(u_wave1Amplitude, u_wave1Length, u_wave1Dir, u_wave1Speed, worldPosition.xz, vNormal, modelViewPosition);
  getWaveHeight(u_wave2Amplitude, u_wave2Length, u_wave2Dir, u_wave2Speed, worldPosition.xz, vNormal, modelViewPosition);

  vNormal.y = 1.;
  vNormal = normalize(vNormal);

  gl_Position = projectionMatrix * modelViewPosition;
}
