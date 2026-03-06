import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const DEBUG_SHOW_MODEL_ORIGINS = false;
const MODEL_WORLD_SCALE = 1;

const MODEL_CONFIG = [
  {
    key: 'bottom',
    file: 'AB_Bottom_Steel.glb',
    offset: [0, 0, 0]
  },
  {
    key: 'front',
    file: 'AB_Front.glb',
    offset: [0, 0, 0]
  },
  {
    key: 'rear_system',
    file: 'H-образен захват_DIN2.glb',
    offset: [0, 0, 0]
  }
];

const COLOR_PRESETS = {
  gray:   0x9a9a9a,
  yellow: 0xffcc00,
  blue:   0x3b82f6,
  red:    0xef4444
};

// Тук можеш да добавяш думи за части, които НЕ искаш да се боядисват
const PAINT_SKIP_TOKENS = [
  'bolt',
  'bolts',
  'nut',
  'nuts',
  'washer',
  'washers',
  'screw',
  'screws',
  'fastener',
  'fasteners',
  'гайка',
  'гайки',
  'болт',
  'болтове',
  'шайба',
  'шайби',
  'винт',
  'винтове',
  'din',
  'iso'
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
camera.position.set(3000, 2200, 3000);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 500, 0);
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight1.position.set(3000, 4000, 2500);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight2.position.set(-2500, 1800, -1500);
scene.add(dirLight2);

const grid = new THREE.GridHelper(12000, 120, 0x666666, 0x333333);
scene.add(grid);

const worldAxes = new THREE.AxesHelper(1000);
scene.add(worldAxes);

const loader = new GLTFLoader();

const loadedModels = [];
let activeOverrideMaterial = null;

function setStatus(lines) {
  statusEl.textContent = Array.isArray(lines) ? lines.join('\n') : String(lines);
}

function createModelOriginHelper(size = 120) {
  const group = new THREE.Group();

  const axes = new THREE.AxesHelper(size);
  group.add(axes);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(size * 0.08, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  group.add(sphere);

  return group;
}

function rememberOriginalMaterial(mesh) {
  if (!mesh.userData.dpOriginalMaterial) {
    mesh.userData.dpOriginalMaterial = mesh.material;
  }
}

function disposeActiveOverrideMaterial() {
  if (activeOverrideMaterial) {
    activeOverrideMaterial.dispose();
    activeOverrideMaterial = null;
  }
}

function getMaterialName(material) {
  if (Array.isArray(material)) {
    return material
      .map(m => (m?.name || '').toLowerCase())
      .join(' ');
  }

  return (material?.name || '').toLowerCase();
}

function getNodePath(node) {
  const names = [];
  let current = node;

  while (current) {
    if (current.name) {
      names.push(current.name.toLowerCase());
    }
    current = current.parent;
  }

  return names.join(' / ');
}

function shouldSkipPaint(mesh) {
  const meshName = (mesh.name || '').toLowerCase();
  const materialName = getMaterialName(mesh.material);
  const nodePath = getNodePath(mesh);

  return PAINT_SKIP_TOKENS.some(token =>
    meshName.includes(token) ||
    materialName.includes(token) ||
    nodePath.includes(token)
  );
}

function applyOriginalMaterials() {
  disposeActiveOverrideMaterial();

  for (const model of loadedModels) {
    model.root.traverse((obj) => {
      if (!obj.isMesh) return;

      if (obj.userData.dpOriginalMaterial) {
        obj.material = obj.userData.dpOriginalMaterial;
      }
    });
  }
}

function createOverrideMaterial(hexColor) {
  return new THREE.MeshStandardMaterial({
    color: hexColor,
    roughness: 0.28,
    metalness: 0.18
  });
}

function applyOverrideColor(hexColor) {
  disposeActiveOverrideMaterial();
  activeOverrideMaterial = createOverrideMaterial(hexColor);

  for (const model of loadedModels) {
    model.root.traverse((obj) => {
      if (!obj.isMesh) return;

      rememberOriginalMaterial(obj);

      if (shouldSkipPaint(obj)) {
        obj.material = obj.userData.dpOriginalMaterial;
      } else {
        obj.material = activeOverrideMaterial;
      }
    });
  }
}

function getModelBox(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  return { box, size, center };
}

function formatVec3(v) {
  return `${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)}`;
}

function fitCameraToObjects(objects, offset = 1.35) {
  const box = new THREE.Box3();

  for (const obj of objects) {
    box.expandByObject(obj);
  }

  if (box.isEmpty()) return;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  const fov = THREE.MathUtils.degToRad(camera.fov);
  let distance = Math.abs((maxDim / 2) / Math.tan(fov / 2));
  distance *= offset;

  const direction = new THREE.Vector3(1, 0.65, 1).normalize();

  camera.position.copy(center).add(direction.multiplyScalar(distance));
  camera.near = Math.max(0.1, maxDim / 1000);
  camera.far = Math.max(10000, maxDim * 30);
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

async function loadModel(modelConfig) {
  return new Promise((resolve, reject) => {
    loader.load(
      encodeURI(modelConfig.file),
      (gltf) => {
        const root = gltf.scene;
        root.name = modelConfig.file;

        root.position.set(
          modelConfig.offset[0],
          modelConfig.offset[1],
          modelConfig.offset[2]
        );

        root.scale.setScalar(MODEL_WORLD_SCALE);
        root.updateMatrixWorld(true);

        let meshCount = 0;

        root.traverse((obj) => {
          if (!obj.isMesh) return;

          meshCount += 1;
          rememberOriginalMaterial(obj);

          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => {
              if (m) m.side = THREE.DoubleSide;
            });
          } else if (obj.material) {
            obj.material.side = THREE.DoubleSide;
          }
        });

        const { size, center } = getModelBox(root);

        scene.add(root);
        root.updateMatrixWorld(true);

        if (DEBUG_SHOW_MODEL_ORIGINS) {
          const helper = createModelOriginHelper(120);
          const worldPos = new THREE.Vector3();
          root.getWorldPosition(worldPos);
          helper.position.copy(worldPos);
          scene.add(helper);
        }

        resolve({
          key: modelConfig.key,
          file: modelConfig.file,
          root,
          meshCount,
          size,
          center
        });
      },
      undefined,
      (error) => {
        reject(new Error(`Грешка при зареждане на ${modelConfig.file}: ${error.message || error}`));
      }
    );
  });
}

async function init() {
  try {
    setStatus('Зареждане на GLB файловете...');

    for (const modelConfig of MODEL_CONFIG) {
      setStatus(`Зареждане: ${modelConfig.file}`);
      const model = await loadModel(modelConfig);
      loadedModels.push(model);
    }

    fitCameraToObjects(loadedModels.map(x => x.root));

    const lines = ['Заредени файлове:'];
    for (const model of loadedModels) {
      lines.push(
        `- ${model.file} | meshes: ${model.meshCount} | center: ${formatVec3(model.center)} | size: ${formatVec3(model.size)}`
      );
    }

    setStatus(lines);

    window.dpModels = loadedModels;
    console.log('Loaded models:', loadedModels);
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

document.getElementById('btnOriginal').addEventListener('click', () => {
  applyOriginalMaterials();
});

document.getElementById('btnGray').addEventListener('click', () => {
  applyOverrideColor(COLOR_PRESETS.gray);
});

document.getElementById('btnYellow').addEventListener('click', () => {
  applyOverrideColor(COLOR_PRESETS.yellow);
});

document.getElementById('btnBlue').addEventListener('click', () => {
  applyOverrideColor(COLOR_PRESETS.blue);
});

document.getElementById('btnRed').addEventListener('click', () => {
  applyOverrideColor(COLOR_PRESETS.red);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
animate();
