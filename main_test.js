import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

const DEBUG_SHOW_MODEL_ORIGINS = false;
const MODEL_WORLD_SCALE = 1000;

const MODEL_CONFIG = [
  { key: 'bottom', file: 'AB_Bottom_Steel.glb', offset: [0, 0, 0] },
  { key: 'front', file: 'AB_Front.glb', offset: [0, 0, 0] },
  { key: 'rear_system', file: 'H-образен захват_DIN2.glb', offset: [0, 0, 0] }
];

const COLOR_PRESETS = {
  gray: 0x9a9a9a,
  yellow: 0xffcc00,
  blue: 0x3b82f6,
  red: 0xef4444
};

const PAINT_SKIP_TOKENS = [
  'bolt', 'bolts', 'nut', 'nuts', 'washer', 'washers', 'screw', 'screws',
  'fastener', 'fasteners',
  'гайка', 'гайки', 'болт', 'болтове', 'шайба', 'шайби', 'винт', 'винтове',
  'Протектор зад бюгел' , 'Протектор' , 'DIN_933' , 'Поп'
  
];

// exact names from your debug dump
const STEEL_ROLLER_EXACT_NAMES = [
  'Ролка стоманена -159x2901',
  'Ролка стоманена -159x2902'
];

const HARDWARE_TOKENS = [
  'din 125',
  'din 128',
  'din 933',
  'din en',
  'bolt',
  'nut',
  'washer',
  'гайка',
  'болт',
  'шайба'
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
camera.up.set(0, 0, 1);
camera.position.set(-7000, -5000, 3500);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.screenSpacePanning = false;
controls.target.set(-3000, 0, 700);
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 1.7);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
dirLight1.position.set(-4000, -2500, 5000);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.85);
dirLight2.position.set(3500, 2000, 2500);
scene.add(dirLight2);

const grid = new THREE.GridHelper(12000, 120, 0x666666, 0x333333);
grid.rotation.x = Math.PI / 2;
scene.add(grid);

const worldAxes = new THREE.AxesHelper(1000);
scene.add(worldAxes);

const loader = new GLTFLoader();

const loadedModels = [];
let activeOverrideMaterial = null;

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[х]/g, 'x')           // кирилско х -> латинско x
    .replace(/[–—−]/g, '-')         // всички тирета -> обикновено -
    .replace(/[_\-\s:()]+/g, '')    // махаме separator-ите
    .replace(/[^\p{L}\p{N}]/gu, '') // махаме друг junk
    .trim();
}

function setParentObjectVisibilityByNormalizedContains(root, searchNeedle, visible) {
  const needle = normalizeName(searchNeedle);
  let hits = 0;

  root.traverse((obj) => {
    if (obj.isMesh) return;
    if (!obj.name) return;

    const normalizedObjectName = normalizeName(obj.name);

    if (normalizedObjectName.includes(needle)) {
      obj.visible = visible;
      hits += 1;
      console.log(`Matched normalized parent -> [${obj.type}] ${obj.name}`);
    }
  });

  return hits;
}

function setStatus(lines) {
  if (!statusEl) return;
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

function getObjectMaterialName(obj) {
  if (!obj.isMesh) return '';

  if (Array.isArray(obj.material)) {
    return obj.material
      .map(m => (m?.name || '').toLowerCase())
      .join(' ');
  }

  return (obj.material?.name || '').toLowerCase();
}

function getObjectPath(obj) {
  const names = [];
  let current = obj;

  while (current) {
    if (current.name) {
      names.push(current.name.toLowerCase());
    }
    current = current.parent;
  }

  return names.join(' / ');
}

function objectMatchesTokens(obj, tokens) {
  const objectName = (obj.name || '').toLowerCase();
  const objectPath = getObjectPath(obj);
  const materialName = getObjectMaterialName(obj);

  return tokens.some(token => {
    const search = token.toLowerCase();
    return (
      objectName.includes(search) ||
      objectPath.includes(search) ||
      materialName.includes(search)
    );
  });
}

function shouldSkipPaint(mesh) {
  return objectMatchesTokens(mesh, PAINT_SKIP_TOKENS);
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
    roughness: 0.24,
    metalness: 0.22
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

function fitCameraToObjects(objects, offset = 1.25) {
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

  const direction = new THREE.Vector3(-1.25, -0.95, 0.65).normalize();

  camera.position.copy(center).add(direction.multiplyScalar(distance));
  camera.near = Math.max(0.1, maxDim / 1000);
  camera.far = Math.max(10000, maxDim * 30);
  camera.up.set(0, 0, 1);
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

function showAllObjects(root) {
  root.traverse((obj) => {
    obj.visible = true;
  });
}

function getModelByKey(key) {
  return loadedModels.find(x => x.key === key);
}

function buildNameIndex(root) {
  const index = new Map();

  root.traverse((obj) => {
    if (!obj.name) return;

    const key = normalizeName(obj.name);

    if (!index.has(key)) {
      index.set(key, []);
    }

    index.get(key).push(obj);
  });

  return index;
}

function setVisibilityByExactNamesFromIndex(model, objectNames, visible) {
  if (!model?.nameIndex) return 0;

  let hits = 0;

  for (const name of objectNames) {
    const key = normalizeName(name);
    const matches = model.nameIndex.get(key) || [];

    for (const obj of matches) {
      obj.visible = visible;
      hits += 1;
      console.log(`Matched exact -> [${obj.type}] ${obj.name}`);
    }
  }

  return hits;
}

function setVisibilityByTokens(root, tokens, visible) {
  let hits = 0;

  root.traverse((obj) => {
    if (objectMatchesTokens(obj, tokens)) {
      obj.visible = visible;
      hits += 1;
    }
  });

  return hits;
}

function hideSteelRollers() {
  const bottom = getModelByKey('bottom');
  if (!bottom) {
    console.warn('Bottom model not found');
    return;
  }

  const hits = setParentObjectVisibilityByNormalizedContains(
    bottom.root,
    'ролка стоманена 159x290',
    false
  );

  console.log(`Hide steel rollers -> matched normalized parent objects: ${hits}`);
}

function showSteelRollers() {
  const bottom = getModelByKey('bottom');
  if (!bottom) {
    console.warn('Bottom model not found');
    return;
  }

  const hits = setParentObjectVisibilityByNormalizedContains(
    bottom.root,
    'ролка стоманена 159x290',
    true
  );

  console.log(`Show steel rollers -> matched normalized parent objects: ${hits}`);
}

function debugNormalizedBottomNames() {
  const bottom = getModelByKey('bottom');
  if (!bottom) return;

  console.groupCollapsed('BOTTOM NORMALIZED NAMES');

  bottom.root.traverse((obj) => {
    if (obj.isMesh) return;
    if (!obj.name) return;

    console.log(obj.name, '=>', normalizeName(obj.name));
  });

  console.groupEnd();
}

function hideHardware() {
  let totalHits = 0;

  for (const model of loadedModels) {
    totalHits += setVisibilityByTokens(model.root, HARDWARE_TOKENS, false);
  }

  console.log(`Hide hardware -> matched objects: ${totalHits}`);
}

function showAll() {
  for (const model of loadedModels) {
    showAllObjects(model.root);
  }
}

function dumpNodeNames(root, label = 'model') {
  console.groupCollapsed(`NODE DUMP: ${label}`);

  root.traverse((obj) => {
    if (!obj.name) return;
    console.log(`[${obj.type}] ${obj.name}`);
  });

  console.groupEnd();
}

function dumpNamedNodesForModel(modelKey) {
  const model = getModelByKey(modelKey);
  if (!model) {
    console.warn(`Model not found: ${modelKey}`);
    return;
  }

  dumpNodeNames(model.root, modelKey);
}

function debugLookupExactName(modelKey, name) {
  const model = getModelByKey(modelKey);
  if (!model?.nameIndex) {
    console.warn('Model or nameIndex missing');
    return;
  }

  const key = normalizeName(name);
  const matches = model.nameIndex.get(key) || [];

  console.log(`Lookup "${name}" -> ${matches.length} matches`);
  matches.forEach(obj => console.log(`[${obj.type}] ${obj.name}`));
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
          center,
          nameIndex: buildNameIndex(root)
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
    window.dpDebug = {
      loadedModels,
      hideSteelRollers,
      hideHardware,
      showAll,
      applyOriginalMaterials,
      applyOverrideColor,
      dumpNamedNodesForModel,
      debugLookupExactName,
      debugNormalizedBottomNames
    };

    console.log('Loaded models:', loadedModels);
    console.log('dpDebug.dumpNamedNodesForModel("bottom")');
    console.log('dpDebug.debugLookupExactName("bottom", "Ролка_стоманена_-159x2901")');
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

document.getElementById('btnHideSteelRollers').addEventListener('click', () => {
  hideSteelRollers();
});

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

document.getElementById('btnHideSteelRollers').addEventListener('click', () => {
  hideSteelRollers();
});

document.getElementById('btnShowSteelRollers').addEventListener('click', () => {
  showSteelRollers();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
animate();
