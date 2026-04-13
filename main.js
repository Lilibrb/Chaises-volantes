import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import {HDRLoader} from "three/addons/loaders/HDRLoader.js";

// scène, caméra, renderer

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xddeeff);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// lumières

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const positions = [
  new THREE.Vector3(5, 4, 5),
  new THREE.Vector3(-5, 4, 5),
  new THREE.Vector3(5, 4, -5),
  new THREE.Vector3(-5, 4, -5),
];

positions.forEach((pos) => {
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.copy(pos);
  light.castShadow = true;
  
  scene.add(light);
});

const innerLight = new THREE.PointLight(0xffffff, 0.6, 10);
innerLight.position.set(0, 2, 0);
scene.add(innerLight);

// sol

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x888888 })
);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -0.5;
plane.receiveShadow = true;
scene.add(plane);

scene.add(new THREE.GridHelper(20, 10));

//controls

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = false;
controls.enablePan = true;
controls.enableZoom = true;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
);

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let manege;
let manegeCenter = new THREE.Vector3();
let rotationAngle = 0;

const chairs = [];
const swingSlider = document.getElementById("swingSlider");


gltfLoader.load("/public/Chaisesvolantes_final.glb", (gltf) => {
  manege = gltf.scene;
  scene.add(manege);

  const box = new THREE.Box3().setFromObject(manege);
  const center = box.getCenter(new THREE.Vector3());
  manegeCenter.copy(center);

  manege.traverse((obj) => {
    if (obj.name.toLowerCase().includes("chair")) {
      obj.castShadow = true;

      const pos = obj.position.clone();

      obj.userData.initialPosition = pos.clone();

      obj.userData.radius = new THREE.Vector3(
        pos.x - center.x,
        0,
        pos.z - center.z
      );

      obj.userData.initialRotation = obj.rotation.clone();

      chairs.push(obj);
    }
  });

  const size = box.getSize(new THREE.Vector3());
const distance = Math.max(size.x, size.z) * 2;

camera.position.set(
  distance * 0.6,
  size.y * 0.4,
  distance
);

controls.target.set(0, size.y * 0.4, 0);
controls.update();

});
// animation

function animate() {
  controls.update();

  const sliderValue = parseFloat(swingSlider.value || 0);

  const speed = 0.01 + sliderValue * 0.01;
  rotationAngle -= speed;

  const maxLift = 4;
  const maxTilt = Math.PI / 8;

chairs.forEach((chair) => {

  const radius = chair.userData.radius;
  const baseY = chair.userData.initialPosition.y;

  const liftFactor = sliderValue / 5;

const angle = liftFactor * maxTilt;

const radiusScale = Math.sin(angle);

const x =
  manegeCenter.x +
  (radius.x * (1 + radiusScale) * Math.cos(rotationAngle) -
  radius.z * (1 + radiusScale) * Math.sin(rotationAngle));

const z =
  manegeCenter.z +
  (radius.x * (1 + radiusScale) * Math.sin(rotationAngle) +
  radius.z * (1 + radiusScale) * Math.cos(rotationAngle));


const y = baseY + liftFactor * maxLift;
chair.position.set(x, y, z);

const outward = new THREE.Vector3(x - manegeCenter.x, 0, z - manegeCenter.z).normalize();

chair.lookAt(chair.position.clone().add(outward));

chair.rotateY(-Math.PI / 2);

  const tilt = (sliderValue / 5) * maxTilt;
  chair.rotation.x += tilt;
  chair.rotation.z += tilt;
});

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});