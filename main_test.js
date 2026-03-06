import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_FILES = [
  'AB_Bottom_Steel.glb',
  'AB_Front.glb',
  'H-образен захват_DIN2.glb'
];

const app = document.getElementById('app');
const statusEl = document.getElementById('status');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e1e);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
);
camera.position.set(2500, 1800, 2500);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 500, 0);
controls.update();

// Светлини
const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight1.position.set(2000, 3000, 2000);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight2.position.set(-2000, 1500, -1500);
scene.add(dirLight2);

// Helpers
const grid = new THREE.GridHelper(10000, 100, 0x666666, 0x333333);
scene.add(grid);

const axes = new THREE.AxesHelper(1000);
scene.add(axes);

const loader = new GLTFLoader();

async function loadModel(fileName) {
  return new Promise((resolve, reject) => {
    loader.load(
      encodeURI(fileName),
      (gltf) => {
        const root = gltf.scene;
        root.name = fileName;

        root.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = false;
            obj.receiveShadow = false;
            if (obj.material) {
              obj.material.side = THREE.DoubleSide;
            }
          }
        });

        scene.add(root);
        resolve(root);
      },
      undefined,
      (error) => reject(new Error(`Грешка при зареждане на ${fileName}: ${error.message || error}`))
    );
  });
}

function fitCameraToObjects(objects, offset = 1.25) {
  const box = new THREE.Box3();

  for (const obj of objects) {
    box.expandByObject(obj);
  }

  if (box.isEmpty()) {
    console.warn('Bounding box is empty.');
    return;
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  let cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));
  cameraZ *= offset;

  const dir = new THREE.Vector3(1, 0.7, 1).normalize();

  camera.position.copy(center).add(dir.multiplyScalar(cameraZ));
  camera.near = Math.max(0.1, maxDim / 1000);
  camera.far = Math.max(10000, maxDim * 20);
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

async function init() {
  try {
    statusEl.textContent = 'Зареждане на GLB файловете...';

    const loadedObjects = [];

    for (const file of MODEL_FILES) {
      statusEl.textContent = `Зареждане: ${file}`;
      const obj = await loadModel(file);
      loadedObjects.push(obj);
    }

    fitCameraToObjects(loadedObjects);

    statusEl.textContent = `Заредени ${loadedObjects.length} файла успешно.`;
    console.log('Loaded models:', loadedObjects.map(x => x.name));
  } catch (error) {
    console.error(error);
    statusEl.textContent = error.message;
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
animate();
