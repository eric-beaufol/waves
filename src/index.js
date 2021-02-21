import * as THREE from 'three'
import './index.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' 
import fragmentShader from './fragment.glsl'
import vertexShader from './vertex.glsl'
import Stats from 'stats.js'
import { GUI } from 'dat.gui'
import { Colors } from 'three'

let renderer, scene, camera, controls, uniforms, clock, geo, stats, gui, mat, directionalLight
const rootEl = document.querySelector('#root')
const waves = []
const params = {
  waveSpeed: 1,
  waveHeight: .02,
  waveFrequency: 6.5,
  peak: 1.5,
  shininess: 100,
  emissive: 0x124860,
  specular: 0xffffff,
  lightIntensity: .17,
  wireframe: false,
  circular: false
}

function init() {
  renderer = new THREE.WebGLRenderer({antialias: true})
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 10000)
  camera.position.z = 100
  camera.position.y = 20
  camera.lookAt(scene.position)

  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;

  renderer.shadowCameraNear = .1;
  renderer.shadowCameraFar = camera.far;
  renderer.shadowCameraFov = 50;

  renderer.shadowMapBias = 0.0039;
  renderer.shadowMapDarkness = 0.5;
  renderer.shadowMapWidth = 1024;
  renderer.shadowMapHeight = 1024;

  rootEl.appendChild(renderer.domElement)
  window.addEventListener('resize', setSize)
  
  clock = new THREE.Clock()
  controls = new OrbitControls(camera, renderer.domElement)

  stats = new Stats()
  stats.showPanel(0)
  document.body.appendChild(stats.dom)

  directionalLight = new THREE.DirectionalLight(0xffffff, .17);
  directionalLight.castShadow = true
  directionalLight.position.y = 200
  directionalLight.position.z = -1000
  directionalLight.position.x = 0
  scene.add(directionalLight)

  // const pointLight = new THREE.PointLight(0xffffff, .17);
  // pointLight.castShadow = true
  // pointLight.position.y = 200
  // pointLight.position.z = -20
  // pointLight.position.x = 0
  // scene.add(pointLight)

  const directionLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1)
  scene.add(directionLightHelper)

  // const pointLightHelper = new THREE.PointLightHelper(pointLight, 1)
  // scene.add(pointLightHelper)

  const ambientLight = new THREE.AmbientLight(0xffffff, .1)
  scene.add(ambientLight)

  addWaves()
  addPlane()

  gui = new GUI()
  const generic = gui.addFolder('Wave')
  
  generic.add(uniforms.u_waveHeight, 'value', 0, 10, .01).name('height')
  generic.add(uniforms.u_waveFrequency, 'value', 0, .5, .001).name('frequency')
  generic.add(uniforms.u_peak, 'value', 1, 8, .1).name('peak')
  generic.add(uniforms.u_waveSpeed, 'value', 0, 10, .1).name('speed')
  generic.add(uniforms.shininess, 'value', 0, 100, .1).name('shininess')
  generic.open()

  const material = gui.addFolder('Material')
  
  material.add(params, 'shininess', 0, 100, .1)
    .onChange(() => {
      mat.shininess = params.shininess
    })
  material.addColor(params, 'specular')
    .onChange(() => {
      mat.u_specular.set(params.specular)
    })
  material.addColor(params, 'emissive')
    .onChange(() => {
      mat.uniforms.u_emissive.value = new THREE.Color(params.emissive)
    })
  material.add(params, 'wireframe')
    .onChange(() => {
      mat.wireframe = params.wireframe
    })
  material.open()
  const light = gui.addFolder('Light')
  light.add(params, 'lightIntensity', 0, 1, 0.001)
    .onChange(() => {
      directionalLight.intensity = params.lightIntensity
    })
  light.open()

  document.body.appendChild(gui.domElement)
  gui.domElement.style.position = 'absolute'
  gui.domElement.style.right = 0
  gui.domElement.style.top = 0

  //addCube()

  setSize()
  animate()
}

function addPlane() {

  uniforms = THREE.UniformsUtils.merge([
    THREE.ShaderLib.phong.uniforms,
    {
      u_time: { type: 'f', value: 1.0 },
      u_specular: {value: new THREE.Color(0xffffff) },
      u_emissive: {value: new THREE.Color(0xffffff) },
      // color: { type: 'vec3', value: new THREE.Color(0x74ebd5) },
      // emissive: { type: 'vec3', value: new THREE.Color(0x124860) },
      shininess: { type: 'f', value: 80. },
      opacity: { type: 'f', value: 1. },
      u_resolution: { type: "v2", value: new THREE.Vector2(innerWidth, innerHeight) },
      u_wave1Length: { type: 'f', value: 5. },
      u_wave1Amplitude: { type: 'f', value: 3. },
      u_wave1Dir: { type: 'vec2', value: new THREE.Vector2(.3, .5) },
      u_wave1Speed: { type: 'f', value: 2.},
      u_wave2Length: { type: 'f', value: 5. },
      u_wave2Amplitude: { type: 'f', value: 2. },
      u_wave2Dir: { type: 'vec2', value: new THREE.Vector2(1, .3) },
      u_wave2Speed: { type: 'f', value: 2.},
      u_wave3Length: { type: 'f', value: 5. },
      u_wave3Amplitude: { type: 'f', value: 2. },
      u_wave3Dir: { type: 'vec2', value: new THREE.Vector2(.8, .1) },
      u_wave3Speed: { type: 'f', value: 2.5},
      u_peak: {type: 'f', value: 1.3},
      u_waveFrequency: {type: 'f', value: 0.5},
      u_waveSpeed: {type: 'f', value: 1.5},
      u_waveHeight: {type: 'f', value: .27},
      u_lightPos: {type: 'vec3', value: new THREE.Vector3()},
    }
  ])

  const size = 100
  const resolution = .4

  geo = new THREE.PlaneBufferGeometry(size, size, Math.round(size * resolution), Math.round(size * resolution))
  mat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide,
    lights: true,
    wireframe: false,
    emissive: params.emissive,
    specular: params.specular
  })

  // mat = new THREE.MeshPhongMaterial({color: 0x74ebd5})

  // mat.onBeforeCompile = shader => {
  //   shader.vertexShader = vertexShader
  //   Object.assign(shader.uniforms, uniforms)
  // }

  // mat = new THREE.MeshPhongMaterial({ 
  //   wireframe: false, 
  //   color: 0x74ebd5,
  //   side: THREE.FrontSide,
  //   shininess: 80,
  //   specular: 0xffffff,
  //   emissive: 0x124860
  // })
  
  const mesh = new THREE.Mesh(geo, mat)
  mesh.rotation.x = -Math.PI / 2
  mesh.receiveShadow = true
  scene.add(mesh)

  console.log(geo)

  // normalsHelper = new VertexNormalsHelper(mesh, .2, 0x00ff00, 1)
  // scene.add(normalsHelper)
}

function addCube() {
  const geo = new THREE.BoxBufferGeometry(1, 1, 1)
  const mat = new THREE.MeshPhongMaterial({color: 'Oxff0000'})
  const mesh = new THREE.Mesh(geo, mat)
  scene.add(mesh)
  mesh.position.set(0, 10, 5)
  mesh.castShadow = true
  mesh.receiveShadow = true
}

function addWaves() {
  let wavelength = 5

  waves.push({
    wavelength: wavelength,
    frequency: 2/wavelength,
    amplitude: 3,
    phase: 2 * 2/wavelength,
    direction: new THREE.Vector2(.3, .5),
    speed: 2
  })

  wavelength = 3

  waves.push({
    wavelength: wavelength,
    frequency: 2/wavelength,
    amplitude: 2,
    phase: 2 * 2/wavelength,
    direction: new THREE.Vector2(1, .3),
    speed: 2
  })

  wavelength = 4

  waves.push({
    wavelength: wavelength,
    frequency: 2/wavelength,
    amplitude: 2,
    phase: 2 * 2/wavelength,
    direction: new THREE.Vector2(.8, .1),
    speed: 2.5
  })
}
 
function setSize() {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  // uniforms.u_resolution.value.x = innerWidth
  // uniforms.u_resolution.value.y = innerHeight
}

function animate() {
  stats.begin()
  render()
  stats.end()

  requestAnimationFrame(animate)
}

function render() {
  uniforms.u_time.value = clock.getElapsedTime()
  // geo.attributes.position.needsUpdate = true
  // geo.computeVertexNormals()
  // normalsHelper.update()
  renderer.render(scene, camera)
}

init()