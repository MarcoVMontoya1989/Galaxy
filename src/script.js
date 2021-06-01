import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parametersGalaxy = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984',
};

let geometryGalaxy = null;
let galaxyPoints = null;
let materialGalaxy = null;

geometryGalaxy = new THREE.BufferGeometry();

const generateGalaxy = () => {
  
  /**
   * Destroy old galaxy
   */
  if (galaxyPoints !== null) {
    geometryGalaxy.dispose();
    materialGalaxy.dispose();
    scene.remove(galaxyPoints);
  }
  
  const positions = new Float32Array(parametersGalaxy.count * 3);
  const colors = new Float32Array(parametersGalaxy.count * 3);
  
  const colorInside = new THREE.Color(parametersGalaxy.insideColor);
  const colorOutside = new THREE.Color(parametersGalaxy.outsideColor);

  for (let i = 0; i < parametersGalaxy.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parametersGalaxy.radius;
    const branchAngles = (i % parametersGalaxy.branches) / parametersGalaxy.branches * (Math.PI * 2);
    const spinAngle = radius * parametersGalaxy.spin;
    
    const randomY = Math.pow(Math.random(), parametersGalaxy.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parametersGalaxy.randomness * radius;
    const randomX = Math.pow(Math.random(), parametersGalaxy.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parametersGalaxy.randomness * radius;
    const randomZ = Math.pow(Math.random(), parametersGalaxy.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parametersGalaxy.randomness * radius;

    positions[i3] = Math.cos(branchAngles + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngles + spinAngle) * radius + randomZ;
  
    const mixColor = colorInside.clone();
    mixColor.lerp(colorOutside, radius / parametersGalaxy.radius);
  
    colors[i3    ] = mixColor.r;
    colors[i3 + 1] = mixColor.g;
    colors[i3 + 2] = mixColor.b;
  }

  geometryGalaxy.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );
  
  geometryGalaxy.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
  );
  
  
  /**
   * Material for Galaxy
   */
  materialGalaxy = new THREE.PointsMaterial({
    size: parametersGalaxy.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });
  
  galaxyPoints = new THREE.Points(geometryGalaxy, materialGalaxy);
  
  scene.add(galaxyPoints);
};

generateGalaxy();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  
  const cameraAngles = elapsedTime * 0.5;
  camera.position.x = Math.cos(elapsedTime * 0.5) * (7 + Math.sin(elapsedTime * .32))

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
};

/**
 * Tweaks
 */
let galaxyFolder = gui.addFolder('Galaxy parameters');

galaxyFolder.add(parametersGalaxy, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
galaxyFolder.add(parametersGalaxy, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
galaxyFolder.add(parametersGalaxy, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
galaxyFolder.add(parametersGalaxy, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
galaxyFolder.add(parametersGalaxy, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
galaxyFolder.add(parametersGalaxy, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
galaxyFolder.add(parametersGalaxy, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
galaxyFolder.addColor(parametersGalaxy, 'insideColor').onFinishChange(generateGalaxy);
galaxyFolder.addColor(parametersGalaxy, 'outsideColor').onFinishChange(generateGalaxy);

tick();