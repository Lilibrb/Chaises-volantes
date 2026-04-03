import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const viewport = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// scene, camera, renderer

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  viewport.width / viewport.height,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(viewport.width, viewport.height); //définie une taille
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.cursorStyle = "grap";
controls.autoRotate = true;

const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x00ff00,
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;

plane.rotation.x = -Math.PI / 2;
plane.position.y = -0.5;

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();

const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;

scene.add(cube, plane);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
);

const imageloader = new THREE.TextureLoader();
const texture = imageloader.load("angel.jpg");
texture.colorSpace = THREE.SRGBColorSpace;

const imgMaterial = new THREE.MeshBasicMaterial({
  map: texture,
});

// const loader = new GLTFLoader();
// loader.setDRACOLoader(dracoLoader);
// loader.load("model.glb", (gltf) => {

//     gltf.scene.traverse((child) => {
//         if (child.isMesh) {
//             child.material = imgMaterial;
//         }
//     });
//     scene.add(gltf.scene);
//     renderer.render(scene, camera);
// });

camera.position.set(1, 2, 3);
camera.lookAt(cube.position);

const ambLight = new THREE.AmbientLight(0xffffff, 1);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(0, 5, 0);
dirLight.target.position.set(-5, 0, 2);
dirLight.castShadow = true;
scene.add(ambLight, dirLight, dirLight.target);

function helpers() {
  const gridHelper = new THREE.GridHelper(10, 5);
  const axesHelper = new THREE.AxesHelper(5);
  gridHelper.position.y = -0.5;

  scene.add(gridHelper, axesHelper);
}

helpers();

window.onresize = () => {
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;

  camera.aspect = viewport.width / viewport.height;
  camera.updateProjectionMatrix();

  renderer.setSize(viewport.width, viewport.height);
  renderer.render(scene, camera);
};

function animate(time) {
  // cube.scale.x = Math.sin(time / 1000) + 2;
  // cube.position.z = Math.sin(time / 1000);
  // cube.rotation.y = Math.PI * Math.sin (time / 1000);
  controls.update();
  renderer.render(scene, camera);
}

// animation en fonction du scroll

// let scrollprogress = 0;
// window.addEventListener("scroll", () => {
//   const scrollTop = window.scrollY;
//   const maxScroll = document.body.scrollHeight - window.innerHeight;

// scrollprogress = scrollTop / maxScroll;

// });

// function animate() {
// resquestAnimationFrame(animate);

// if (manege){
//   const rotationspeed = scrollprogress * 10;
//   manege.position.y += rotationSpeed * 0.01;

//   const maxHeight = 5;
//   manege.position.y = scrollProgress * maxHeight;
// }
//  renderer.render(scene, camera);

// }
// animate();

renderer.setAnimationLoop(animate);

renderer.render(scene, camera);
