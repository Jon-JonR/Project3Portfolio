import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const host = document.querySelector('#viewport');
const tutorialOverlay = document.querySelector('#tutorial-overlay');
const dismissTutorial = () => tutorialOverlay.classList.add('dismissed');
document.querySelector('#tutorial-close').onclick = dismissTutorial;
document.querySelector('#tutorial-dismiss').onclick = dismissTutorial;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x151615);
const spaceTexture = new THREE.TextureLoader().load('images/outer-space-background.png', texture => {
  texture.colorSpace = THREE.SRGBColorSpace;
  scene.background = texture;
});
const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
camera.position.set(0, 5.4, -18);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
host.appendChild(renderer.domElement);

const compositionTarget = new THREE.Vector3(0, 2.15, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(compositionTarget);
controls.enableDamping = true;
controls.dampingFactor = .065;
controls.minDistance = 5;
controls.maxDistance = 28;
controls.maxPolarAngle = Math.PI * .48;
controls.minPolarAngle = .22;
controls.enableRotate = false;
controls.enablePan = true;
controls.enableZoom = false;
controls.screenSpacePanning = true;
const panBounds = { minX: -6.8, maxX: 6.8, minY: .4, maxY: 4.8, minZ: -2.8, maxZ: 2.8 };
controls.addEventListener('change', () => {
  const before = controls.target.clone();
  controls.target.x = THREE.MathUtils.clamp(controls.target.x, panBounds.minX, panBounds.maxX);
  controls.target.y = THREE.MathUtils.clamp(controls.target.y, panBounds.minY, panBounds.maxY);
  controls.target.z = THREE.MathUtils.clamp(controls.target.z, panBounds.minZ, panBounds.maxZ);
  camera.position.add(controls.target).sub(before);
});
scene.add(new THREE.HemisphereLight(0xcfd7d8, 0x171818, 2.1));
const key = new THREE.DirectionalLight(0xffe2c8, 4.1);
key.position.set(-5, 9, 7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key);
const tableFill = new THREE.DirectionalLight(0xb9d7e1, 1.25);
tableFill.position.set(0, 7, -8); scene.add(tableFill);
const rim = new THREE.PointLight(0xf16f51, 12, 13); rim.position.set(5, 4, 0); scene.add(rim);

const mat = (color, rough = .55, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
const tv = new THREE.Group(); tv.position.y = -.05; scene.add(tv);
const bodyMat = mat(0x3b3d39, .58), darkMat = mat(0x161917, .36), woodMat = mat(0x4b3328, .35), orangeMat = mat(0xc75d43, .42);
const box = (size, material, pos, bevel = .12, parent = tv) => {
  const radius = Math.min(bevel, Math.min(...size) / 2 - .01);
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 5, Math.max(.01, radius)), material);
  mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
};
// A simple room keeps the space view contained to a large window behind the set.
const room = new THREE.Group(); scene.add(room);
const roomWallMat = mat(0x252a27, .9);
const roomTrimMat = mat(0x111513, .58);
const roomPart = (size, material, pos, bevel = .04) => box(size, material, pos, bevel, room);
// The room is intentionally oversized so the camera can pan without feeling boxed in.
const roomBackZ = 16;
const roomWallHeight = 20;
const windowWidth = 19;
const windowBottom = -2.25;
const windowTop = 8.45;
const windowHeight = windowTop - windowBottom;
roomPart([(40 - windowWidth) / 2, roomWallHeight, .3], roomWallMat, [-((40 + windowWidth) / 4), 4.3, roomBackZ], .08);
roomPart([(40 - windowWidth) / 2, roomWallHeight, .3], roomWallMat, [((40 + windowWidth) / 4), 4.3, roomBackZ], .08);
roomPart([windowWidth, 20 - windowTop, .3], roomWallMat, [0, (windowTop + 14.3) / 2, roomBackZ], .08);
roomPart([windowWidth, windowBottom + 5.72, .3], roomWallMat, [0, (windowBottom - 5.72) / 2, roomBackZ], .08);
roomPart([.3, roomWallHeight, 30], roomWallMat, [-20, 4.3, 1], .08);
roomPart([.3, roomWallHeight, 30], roomWallMat, [20, 4.3, 1], .08);
roomPart([40, .3, 30], roomWallMat, [0, 14.3, 1], .08);

// No pane is placed in the opening: the scene background is visible through the frame.
const windowFrameZ = roomBackZ - .33;
roomPart([19.7, .28, .28], roomTrimMat, [0, windowTop, windowFrameZ], .04);
roomPart([19.7, .28, .28], roomTrimMat, [0, windowBottom, windowFrameZ], .04);
roomPart([.28, windowHeight + .28, .28], roomTrimMat, [-9.85, (windowTop + windowBottom) / 2, windowFrameZ], .04);
roomPart([.28, windowHeight + .28, .28], roomTrimMat, [9.85, (windowTop + windowBottom) / 2, windowFrameZ], .04);
roomPart([.2, windowHeight, .2], roomTrimMat, [0, (windowTop + windowBottom) / 2, windowFrameZ - .04], .03);
roomPart([19.4, .2, .2], roomTrimMat, [0, (windowTop + windowBottom) / 2, windowFrameZ - .04], .03);
box([6.8, 4.25, 3.15], bodyMat, [0, 2.78, 0], .32);
box([5.32, 3.35, .22], darkMat, [-.62, 3.06, -1.64], .22);
const screenMaterial = mat(0x172522, .3); screenMaterial.emissive = new THREE.Color(0x4cae9d);
const screen = box([4.98, 2.98, .18], screenMaterial, [-.62, 3.06, -1.78], .34);
const glow = new THREE.PointLight(0x79c5b3, 1.5, 4); glow.position.set(-.62, 3, -2); tv.add(glow);
box([.92, 2.05, .13], darkMat, [2.58, 3.58, -1.62], .13); box([1.08, 1.02, .13], darkMat, [2.58, 1.62, -1.63], .12);
for (let row = 0; row < 5; row++) for (let col = 0; col < 6; col++) { const grille = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .025, 12), mat(0x62655e, .85)); grille.rotation.x = Math.PI / 2; grille.position.set(2.17 + col * .14, 1.26 + row * .16, -1.72); tv.add(grille); }
for (let i = 0; i < 2; i++) { const dial = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .12, 24), bodyMat); dial.rotation.x = Math.PI / 2; dial.position.set(2.58, 4.03 - i * .7, -1.73); tv.add(dial); }
for (let i = 0; i < 4; i++) box([.11, .18, .08], bodyMat, [2.18 + i * .2, 2.72, -1.72], .04);
box([.08, .08, .04], orangeMat, [2.87, 2.72, -1.74], .02);
const pole = new THREE.Mesh(new THREE.CylinderGeometry(.045, .07, 1.3, 10), darkMat); pole.position.set(0, 5.46, 0); pole.rotation.z = .22; tv.add(pole);
const antenna = new THREE.Mesh(new THREE.CylinderGeometry(.035, .05, 1.6, 10), darkMat); antenna.position.set(.42, 5.85, 0); antenna.rotation.z = -.62; tv.add(antenna);
box([.72, .72, .78], darkMat, [-2.3, .35, 0], .12); box([.72, .72, .78], darkMat, [2.3, .35, 0], .12);

const tapeMeshes = [];
// Replace each image path below with your own image file when ready.
const tapeMedia = [
  ['ArroWorra Video Game', 'Provided is the video game, "Arro W orra." The video game identifies as a top down shooter that utilizes the necessary mechanics. As of December 2025, the game has been finished, and no further decisions have been made to further polish or upgrade the game. This project was a collaborative project that includes 2 programmers and myself as the only artist, creating all of the assets and visuals for the game.', null, 'images/better_thumbnail.png', 'https://itch.io/embed/3980542'],
  ['Allusions Fighting Game', 'A visual combination of many video games alike, specifically the genre of fighting games. Alongside many references to media and video games, the video uses creative techniques to incorporate these allusions into a fighting game. The unique movement is meant to accurately replicate player movement as seen in a fighting game, thus giving the scene an authentic feeling.', 'c91OeMWzF8U', 'images/Allusions_Fighting_GameSS.jpg'],
  ['Press the Button Video Game', 'Being my first 3D video game project, this video game showcased my ability to create a 3D environment for a video game, mimicking the kind of trapped feeling inside of an asylum. The game consists of repeating a straight room with a new obstacle with every new level.', null, 'images/Press_the_Button_Thumbnail.png', 'https://itch.io/embed/4825287'],
  ['I Love Myself Music Lyric Video', 'Inspired by Kanye Wests All of the Lights, music video produced in 2011, this music video follows with the song, I by Kendrick Lamar which tackles on the idea of loving yourself during a time where suicide takes a toll on peoples lives young or old, black or white. Visual lyrics, accompanied by flashing letters, gives a kind of feeling that despite being somewhat painful to see, gives off a feeling of being alive, similar to the kind of feeling one would get in a concert.', 'D2wZtfYZCso', 'images/I_Love_MyselfSS.png'],
  ['Cycles: A Short Film', 'A story unfolded about the narration of one seeing his past self. It interprets the idea that we often go through the same cycles every day without realizing it because it has become so engrained into our everyday lives. This short film narrates the fictional experience of when one sees the cycles hes gone through constantly and eventually develops his own realization, and whether to make a change in his cycles.', '84bD9vlh-ss', 'images/Cycles_SS.png'],
  ['Katana Blender Project', 'Serves as my first personal 3D Asset Creation in Blender. This piece was made to introduce myself to 3D creation, which was purely created in my free time. Because the piece is a beginning project, Ive decided not to delve deep into the complex parts of Blender, and more on the 3D basic building blocks.', null, 'images/Katana_Introduction_Project.png', null, 'models/Katana.glb']
];
const addStorage = (x, colors, start) => {
  const group = new THREE.Group(); group.position.set(x, .25, -1); scene.add(group);
  const part = (size, material, pos, bevel = .05) => box(size, material, pos, bevel, group);
  part([1.35, .5, 1.28], mat(0x31251f, .56), [0, 0, 0], .06);
  part([1.48, .12, .12], mat(0x725041, .58), [0, .31, -.59], .03); part([1.48, .12, .12], mat(0x725041, .58), [0, .31, .59], .03);
  part([.12, .12, 1.05], mat(0x725041, .58), [-.67, .31, 0], .03); part([.12, .12, 1.05], mat(0x725041, .58), [.67, .31, 0], .03);
  colors.forEach((color, i) => { const tape = new THREE.Group(); tape.position.set(-.4 + i * .4, .25, 0); tape.userData = { baseY: .25, hovered: false, media: tapeMedia[start + i] }; const body = part([.4, .82, .62], mat(color, .52), [0, 0, 0], .035); const label = part([.27, .18, .025], mat(0xe3d4b3, .8), [0, .05, -.325], .01); group.remove(body, label); tape.add(body, label); group.add(tape); tapeMeshes.push(tape); });
};
addStorage(4.65, [0xc45c45, 0x6e8f88, 0xc59a57], 0); addStorage(-4.65, [0x7776a5, 0xc48b55, 0x6f9a69], 3);
// Right-side gaming console and controller.
const consoleGroup = new THREE.Group(); consoleGroup.position.set(6.1, 0, .9); scene.add(consoleGroup);
const consoleMat = mat(0x343733, .48), consoleDark = mat(0x151816, .35);
const consoleBox = (size, material, pos, bevel = .1) => box(size, material, pos, bevel, consoleGroup);
consoleBox([2.1, .62, 1.65], consoleMat, [0, .31, 0], .18);
consoleBox([1.3, .06, 1.08], consoleDark, [0, .64, 0], .08);
consoleBox([1.05, .08, .1], consoleDark, [0, .34, -.86], .03);
consoleBox([.12, .12, .08], orangeMat, [.72, .34, -.87], .03);
consoleBox([.06, .1, .08], bodyMat, [.48, .34, -.87], .02);
consoleBox([.32, .12, .08], orangeMat, [-.55, .34, -.87], .04);
consoleBox([.32, .12, .08], mat(0x6e8f88, .48), [-.12, .34, -.87], .04);
consoleBox([.92, .12, .42], consoleDark, [0, .8, .04], .14);
consoleBox([.32, .16, .34], consoleDark, [-.4, .77, .04], .1); consoleBox([.32, .16, .34], consoleDark, [.4, .77, .04], .1);
consoleBox([.22, .04, .07], mat(0xc4c7b9, .58), [-.22, .88, .03], .02); consoleBox([.07, .04, .22], mat(0xc4c7b9, .58), [-.22, .88, .03], .02);
[0xef6b4a, 0x6e8f88, 0xc59a57, 0x7776a5].forEach((color, i) => { const button = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .04, 14), mat(color, .45)); button.position.set(.22 + (i % 2) * .13, .89, .02 + (i > 1 ? .12 : 0)); consoleGroup.add(button); });
[-.1, .1].forEach(x => { const stick = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .05, 16), darkMat); stick.position.set(x, .9, .13); consoleGroup.add(stick); });

// Original VCR console on the left side.
const oldConsoleGroup = new THREE.Group(); oldConsoleGroup.position.set(-6.1, 0, .9); scene.add(oldConsoleGroup);
const oldConsoleBox = (size, material, pos, bevel = .1) => box(size, material, pos, bevel, oldConsoleGroup);
oldConsoleBox([2.05, 1.5, 1.65], consoleMat, [0, .75, 0], .18);
oldConsoleBox([1.65, .48, .12], consoleDark, [0, 1.22, -.84], .05);
oldConsoleBox([.44, .25, .1], orangeMat, [-.62, 1.22, -.91], .04);
oldConsoleBox([.18, .18, .1], bodyMat, [.25, 1.22, -.91], .03);
for (let i = 0; i < 5; i++) oldConsoleBox([.08, .08, .08], bodyMat, [.48 + i * .13, 1.22, -.91], .02);
oldConsoleBox([1.56, .1, 1.32], consoleDark, [0, .23, 0], .04);

const table = new THREE.Group(); scene.add(table); const tableTop = new THREE.Mesh(new THREE.BoxGeometry(16, .45, 8), mat(0x785041, .5)); tableTop.position.y = -.32; tableTop.castShadow = true; tableTop.receiveShadow = true; table.add(tableTop);
const legMat = mat(0x35251f, .62);
[[-6.8, -3, -3], [6.8, -3, -3], [-6.8, -3, 3], [6.8, -3, 3]].forEach(pos => { const leg = new THREE.Mesh(new THREE.BoxGeometry(.42, 5.4, .42), legMat); leg.position.set(...pos); leg.castShadow = true; table.add(leg); });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(39.7, 29.7), mat(0x101110, .82)); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -5.72, 1); scene.add(floor);
const grid = new THREE.GridHelper(40, 40, 0x353531, 0x242522); grid.position.set(0, -5.69, 1); grid.scale.z = .75; grid.material.opacity = .24; grid.material.transparent = true; scene.add(grid);

const resize = () => { const r = host.getBoundingClientRect(); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); renderer.setSize(r.width, r.height, true); }; addEventListener('resize', resize); resize();
const popup = document.querySelector('#info-popup'), tapePopup = document.querySelector('#tape-popup');
const videoFrame = document.querySelector('#info-popup iframe');
const videoFrameContainer = document.querySelector('.video-frame');
const modelViewer = document.querySelector('#model-viewer');
const tapeThumbnail = document.querySelector('#tape-thumbnail');
const tapeTitle = document.querySelector('#tape-title');
const tapeDescription = document.querySelector('#tape-description');
let selectedTapeVideoId = null;
let selectedTapeEmbedUrl = null;
let selectedTapeModelUrl = null;
let insertedVideoReady = false;
let modelLoadedUrl = null;
let modelScene = null;
let modelCamera = null;
let modelRenderer = null;
let modelControls = null;
const modelLoader = new GLTFLoader();
const setupModelViewer = () => {
  if (modelRenderer) return;
  modelScene = new THREE.Scene();
  modelScene.background = new THREE.Color(0x151615);
  modelCamera = new THREE.PerspectiveCamera(35, 1, .01, 100);
  modelCamera.position.set(2.8, 1.8, 3.8);
  modelRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  modelRenderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  modelRenderer.outputColorSpace = THREE.SRGBColorSpace;
  modelRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  modelRenderer.toneMappingExposure = 1.15;
  modelViewer.appendChild(modelRenderer.domElement);
  modelControls = new OrbitControls(modelCamera, modelRenderer.domElement);
  modelControls.enableDamping = true;
  modelControls.minDistance = .5;
  modelControls.maxDistance = 20;
  modelScene.add(new THREE.HemisphereLight(0xd8e0e0, 0x181918, 2.2));
  const modelKey = new THREE.DirectionalLight(0xffe3c8, 3.2);
  modelKey.position.set(3, 5, 4);
  modelScene.add(modelKey);
  const renderModel = () => {
    requestAnimationFrame(renderModel);
    modelControls.update();
    modelRenderer.render(modelScene, modelCamera);
  };
  renderModel();
};
const resizeModelViewer = () => {
  if (!modelRenderer) return;
  const r = modelViewer.getBoundingClientRect();
  modelCamera.aspect = r.width / r.height;
  modelCamera.updateProjectionMatrix();
  modelRenderer.setSize(r.width, r.height, true);
};
const loadModel = url => {
  setupModelViewer();
  resizeModelViewer();
  if (modelLoadedUrl === url) return;
  modelLoadedUrl = url;
  modelLoader.load(url, gltf => {
    if (modelScene && modelScene.userData.loadedModel) modelScene.remove(modelScene.userData.loadedModel);
    const model = gltf.scene;
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const scale = 2.4 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
    modelScene.add(model);
    modelScene.userData.loadedModel = model;
    modelControls.target.set(0, size.y * scale * .35, 0);
    modelControls.update();
  }, undefined, error => console.error('Unable to load Tape 06 model.', error));
};
const setVideoSource = (url, isItchWidget = false) => {
  modelViewer.hidden = true;
  videoFrame.hidden = false;
  videoFrame.src = url;
  videoFrameContainer.classList.toggle('itch-widget', isItchWidget);
};
const setModelSource = url => {
  videoFrame.hidden = true;
  modelViewer.hidden = false;
  videoFrameContainer.classList.remove('itch-widget');
  loadModel(url);
};
document.querySelector('.popup-close').onclick = () => popup.classList.remove('open'); document.querySelector('.tape-close').onclick = () => tapePopup.classList.remove('open');
popup.addEventListener('click', event => { if (event.target === popup) popup.classList.remove('open'); });
tapePopup.addEventListener('click', event => { if (event.target === tapePopup) tapePopup.classList.remove('open'); });
document.querySelector('#tape-insert').onclick = () => {
  if (selectedTapeEmbedUrl || selectedTapeVideoId) {
    setVideoSource(selectedTapeEmbedUrl || `https://www.youtube.com/embed/${selectedTapeVideoId}`, Boolean(selectedTapeEmbedUrl));
    insertedVideoReady = true;
  } else if (selectedTapeModelUrl) {
    setModelSource(selectedTapeModelUrl);
    insertedVideoReady = true;
  }
  tapePopup.classList.remove('open');
  screenMaterial.emissive.set(0x4b83bd);
  screenMaterial.emissiveIntensity = .28;
  glow.color.set(0x4b83bd);
  glow.intensity = .65;
};
const views = { front: [0, 5.4, -18], side: [10.7, 4.6, .1], back: [-7.5, 4.7, 7.6] };
document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => { document.querySelectorAll('[data-view]').forEach(item => item.classList.remove('active')); button.classList.add('active'); camera.position.set(...views[button.dataset.view]); controls.target.set(0, button.dataset.view === 'front' ? 2.15 : 2.45, 0); controls.update(); });
const zoom = document.querySelector('#zoom'), zoomValue = document.querySelector('#zoom-value'); zoom.oninput = () => { camera.position.setLength(+zoom.value); zoomValue.textContent = `${Math.round((20 - camera.position.length()) / 15 * 100)}%`; };
document.querySelector('#reset').onclick = () => { camera.position.set(...views.front); controls.target.set(0, 2.15, 0); controls.update(); zoom.value = 18; zoom.oninput(); document.querySelector('[data-view="front"]').click(); }; zoom.oninput();
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(); let hoveredTape = null; let monitorHovered = false;
renderer.domElement.addEventListener('pointermove', event => { const r = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - r.left) / r.width * 2 - 1, -(event.clientY - r.top) / r.height * 2 + 1); raycaster.setFromCamera(pointer, camera); const tapeHit = raycaster.intersectObjects(tapeMeshes, true)[0]; hoveredTape = tapeHit ? tapeHit.object.parent : null; monitorHovered = raycaster.intersectObject(screen, false).length > 0; screenMaterial.emissiveIntensity = monitorHovered ? .7 : insertedVideoReady ? .28 : 0; renderer.domElement.style.cursor = hoveredTape || (monitorHovered && insertedVideoReady) ? 'pointer' : 'grab'; });
renderer.domElement.addEventListener('click', () => { if (hoveredTape) { const [title, description, videoId, thumbnail, embedUrl, modelUrl] = hoveredTape.userData.media; selectedTapeVideoId = videoId; selectedTapeEmbedUrl = embedUrl; selectedTapeModelUrl = modelUrl; tapeThumbnail.src = thumbnail; tapeThumbnail.alt = `${title} placeholder preview`; tapeTitle.textContent = title; tapeDescription.textContent = description; tapePopup.classList.add('open'); } else if (monitorHovered && insertedVideoReady) { if (selectedTapeModelUrl) setModelSource(selectedTapeModelUrl); else setVideoSource(selectedTapeEmbedUrl || `https://www.youtube.com/embed/${selectedTapeVideoId}?autoplay=1`, Boolean(selectedTapeEmbedUrl)); popup.classList.add('open'); resizeModelViewer(); } });
addEventListener('resize', resizeModelViewer);
addEventListener('keydown', event => { if (event.key === 'Escape') { popup.classList.remove('open'); tapePopup.classList.remove('open'); } });
function animate() { requestAnimationFrame(animate); controls.update(); tapeMeshes.forEach(tape => { tape.position.y = THREE.MathUtils.lerp(tape.position.y, tape.userData.baseY + (tape === hoveredTape ? .34 : 0), .13); }); renderer.render(scene, camera); } animate();
