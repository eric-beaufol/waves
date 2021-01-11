import * as THREE from 'three'
import './index.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' 
import fragmentShader from './fragment.glsl'
import vertexShader from './vertex.glsl'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import Stats from 'stats.js'
import { GUI } from 'dat.gui'

let renderer, scene, camera, controls, uniforms, clock, geo, normalsHelper, stats, gui, mat
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
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 1000)
  camera.position.z = 70
  camera.position.y = 25
  camera.lookAt(scene.position)

  renderer.shadowMapEnabled = true;
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

  const directionalLight = new THREE.DirectionalLight(0xffffff, .17);
  directionalLight.castShadow = true
  directionalLight.position.y = 10
  directionalLight.position.z = -20
  directionalLight.position.x = 0
  scene.add(directionalLight)

  const directionLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1)
  // scene.add(directionLightHelper)

  const ambientLight = new THREE.AmbientLight(0xffffff, .1)
  scene.add(ambientLight)

  gui = new GUI()
  const generic = gui.addFolder('Generic')
  generic.add(params, 'waveSpeed', 0, 10, .1)
  generic.add(params, 'waveHeight', 0, 1, .01)
  generic.add(params, 'waveFrequency', 0, 10, .01)
  generic.add(params, 'peak', 1, 8, .1)
  generic.add(params, 'circular')
  generic.open()
  const material = gui.addFolder('Material')
  material.add(params, 'shininess', 0, 100, .1)
    .onChange(() => {
      mat.shininess = params.shininess
    })
  material.addColor(params, 'specular')
    .onChange(() => {
      mat.specular.set(params.specular)
    })
  material.addColor(params, 'emissive')
    .onChange(() => {
      mat.emissive.set(params.emissive)
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

  addWaves()
  addPlane()
  //addCube()

  setSize()
  animate()
}

function addPlane() {
  uniforms = {
    u_time: { type: 'f', value: 1.0 },
    colorA: { type: 'vec3', value: new THREE.Color(0x74ebd5) },
    colorB: { type: 'vec3', value: new THREE.Color(0xACB6E5) }
  }

  const size = 100
  const resolution = 1

  geo = new THREE.PlaneBufferGeometry(size, size, Math.round(size * resolution), Math.round(size * resolution))
  // const mat = new THREE.ShaderMaterial({
  //   vertexShader,
  //   fragmentShader,
  //   uniforms,
  //   side: THREE.DoubleSide,
  //   wireframe: true
  // })
  mat = new THREE.MeshPhongMaterial({ 
    wireframe: false, 
    color: 0x74ebd5,
    side: THREE.FrontSide,
    shininess: 80,
    specular: 0xffffff,
    emissive: 0x124860
  })
  
  const mesh = new THREE.Mesh(geo, mat)
  mesh.rotation.x = -Math.PI / 2
  mesh.receiveShadow = true
  scene.add(mesh)

  normalsHelper = new VertexNormalsHelper(mesh, .2, 0x00ff00, 1)
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
}

function animate() {
  stats.begin()
  render()
  stats.end()

  requestAnimationFrame(animate)
}

function render() {
  uniforms.u_time.value = clock.getElapsedTime()
  const elapsed = clock.getElapsedTime()
  const positions = geo.attributes.position.array

  for (let i = 2; i < positions.length; i+=3) {
    const x = positions[i - 2]
    const y = positions[i - 1]
    let z = 0

    for (let ii = 0; ii < waves.length; ii++) {
      const { amplitude, direction, frequency, phase, speed } = waves[ii]
      const { waveSpeed, waveHeight, waveFrequency, peak } = params
      const vectorXY = new THREE.Vector2(x, y)
      
      // z += amplitude * waveHeight * Math.sin(
      //   direction.dot(vectorXY) * frequency * waveFrequency + elapsed * speed * phase * waveSpeed
      // )

      z += 2 * amplitude * waveHeight * Math.pow(
        (Math.sin(direction.dot(vectorXY) * frequency * waveFrequency + elapsed * speed * phase * waveSpeed) + 1) / 2, 
        peak
      )
    }

    geo.attributes.position.array[i] = z;
  }

  geo.attributes.position.needsUpdate = true
  geo.computeVertexNormals()
  normalsHelper.update()

  renderer.render(scene, camera)
}

init()