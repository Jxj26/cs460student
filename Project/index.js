import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

let renderer, scene, camera, controls;
let stats;
let rectangles = [];
const clock = new THREE.Clock();

const w = window.innerWidth;
const h = window.innerHeight;
renderer = new THREE.WebGLRenderer({antialias: true });
renderer.setSize(w, h);
renderer.setAnimationLoop( animate );
document.body.appendChild(renderer.domElement);

// setup camera
const fov = 75;
const aspect = w / h;
const znear = 1;
const zfar = 1000;
camera = new THREE.PerspectiveCamera(fov, aspect, znear, zfar);
camera.position.set(20, 15, -35);
camera.rotateY(Math.PI);
camera.rotateX(0);
scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x0a0f14, 0.007);

//first person controls
controls = new FirstPersonControls( camera, renderer.domElement );
controls.activeLook = false;
controls.movementSpeed = 50;
controls.lookSpeed = 0.1;

// Floor
const geoFloor = new THREE.BoxGeometry( 1000, 0.5, 1000 );
const matStdFloor = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, roughness: 0.2, metalness: .8, side: THREE.DoubleSide } );
const mshStdFloor = new THREE.Mesh( geoFloor, matStdFloor );
scene.add( mshStdFloor );


// Handle window resize
function onWindowResize() {
  renderer.setSize( window.innerWidth, window.innerHeight );
	camera.aspect = ( window.innerWidth / window.innerHeight );
	camera.updateProjectionMatrix();
  controls.handleResize();
}
window.addEventListener( 'resize', onWindowResize );

// Fps
stats = new Stats();
document.body.appendChild( stats.dom );

// Lighting ---------------------------------------------------------------------------------------

// Ambient light
const ambient = new THREE.AmbientLight(0x404050, .5);
scene.add(ambient);

// Directional light : Moon light
const moonLight = new THREE.DirectionalLight(0x8899ff, 0.6);
moonLight.position.set(-50, 100, -50);
scene.add(moonLight);

// Sun light under the plane
const underLight = new THREE.DirectionalLight(0xffddaa, 1.5); // warm sunlight color
underLight.position.set(50, -100, 50); // below the plane
underLight.target.position.set(0, 0, 0); // points toward the plane
scene.add(underLight);
scene.add(underLight.target);

// Basic Material Torus
const geo = new THREE.TorusKnotGeometry(10, 5, 100, 16);
const material = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0, metalness: 0 } );
const mesh = new THREE.Mesh(geo, material);
mesh.position.set(0, 100, 0);
scene.add(mesh);
// Another Basic Material Torus
const mesh2 = new THREE.Mesh(geo, material);
mesh2.position.set(0, -100, 0);
scene.add(mesh2);

//--------------------------------------------------------------------------------------------

//Random shapes  ---------------------------------------------------------------------
function createRandomShape(invert) {
    // pick a random geometry
    const geometries = [
        new THREE.BoxGeometry(5, 5, 5),
        new THREE.TetrahedronGeometry(5),
        new THREE.OctahedronGeometry(5),
        new THREE.DodecahedronGeometry(5),
        new THREE.IcosahedronGeometry(5)
    ];
    
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];

    // random material color
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
        roughness: 0.5,
        metalness: 0.5
    });

    const mesh = new THREE.Mesh(geometry, material);

    // random position in the sky
    if (invert != true) {
      mesh.position.set(
        THREE.MathUtils.randFloatSpread(400), // x
        THREE.MathUtils.randFloat(50, 200),   // y
        THREE.MathUtils.randFloatSpread(400)  // z
    );
    } else {
      mesh.position.set(
        THREE.MathUtils.randFloatSpread(400), // x
        THREE.MathUtils.randFloat(-50, -200),   // y
        THREE.MathUtils.randFloatSpread(400)  // z
    );
    }
    // random rotation speed
    mesh.userData.rotationSpeed = {
        x: Math.random() * 0.01,
        y: Math.random() * 0.01,
        z: Math.random() * 0.01
    };

    return mesh;
}
const NUM_SHAPES = 100;
const skyShapes = [];

for (let i = 0; i < NUM_SHAPES; i++) {
  if (i < NUM_SHAPES/2 ) 
  {
    const shape = createRandomShape();
    scene.add(shape);
    skyShapes.push(shape);
  } else {
    const shape = createRandomShape(true);
    scene.add(shape);
    skyShapes.push(shape);
  }
}
// ----------------------------------------------------------------------------------

// Light Rectangles ---------------------------------------------------------------
RectAreaLightUniformsLib.init();
// Creates Rectangles lights side by side, x is the number of lights and y is y position
const CreateLightRectArray = (count, radius, y) => {
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2; // divide full circle
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    //let color = vector
  const colors = [0xff88cc, 0x88ccff, 0xaaffee, 0xffff88];
  const rect = new THREE.RectAreaLight(colors[i % colors.length], 5, 4, 10);
    rectangles.push(rect);
    rect.position.set(x, y, z);
    scene.add(rect);
    scene.add( new RectAreaLightHelper( rect ) );
  }
}
CreateLightRectArray(8, 50, 5);
CreateLightRectArray(8, 50, -5);
// ---------------------------------------------------------------------------------


// Sky Partticles ----------------------------------------------
const geometry = new THREE.BufferGeometry();
const vertices = [];
for ( let i = 0; i < 5000; i ++ ) {
	vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
	vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
	vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z
}
geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
const particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
scene.add( particles );

// -------------------------------------------------------------




// Particle Explosion -------------------------------------------------
const COUNT = 500;
// particle geometry 
const pointGeo = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT * 3);
pointGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const material2 = new THREE.PointsMaterial({
    color: 0xffffff,
    size: .5,
});

const points = new THREE.Points(pointGeo, material2);
scene.add(points);

// --- store base positions ---
const circlePositions = [];
const expandedPositions = [];

for (let i = 0; i < COUNT; i++) {
    // circle
    const angle = (i / COUNT) * Math.PI * 2;
    const radius = 2;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = 0;

    circlePositions.push(new THREE.Vector3(x, y, z));

    // expanded: random direction
    const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    );
    expandedPositions.push(dir);
}
// ----------------------------------------------------------------------

// --- control target state ---
let targetState = "circle"; // "circle" or "expanded"

const mainLights = [ambient, moonLight, underLight];
let lightsOn = true;
let activeCont = false;
// --- key controls ---
window.addEventListener("keydown", (e) => {
    if (e.key === "q") targetState = "expanded";
    if (e.key === "e") targetState = "circle";
    if (e.key === "g") {
        lightsOn = !lightsOn;

        mainLights.forEach(light => {
            light.visible = lightsOn;
        });
    }
    if (e.key === "c"){
      activeCont = !activeCont;
      controls.activeLook = activeCont;
    } 
});


// Create trees -----------------------------------------------------------
function createLowPolyTree(x, y, z) {
    const tree = new THREE.Group();

    // --- trunk ---
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 6, 6);
    const trunkMat = new THREE.MeshStandardMaterial({
        color: 0x2b2b2b,
        roughness: 1,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 3;
    tree.add(trunk);

    // --- Tree top ---
    const canopyGeo = new THREE.ConeGeometry(3.5, 8, 6);
    const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x1e3b2f, 
        roughness: 1,
        flatShading: true
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 8.5;
    tree.add(canopy);

    tree.position.set(x, y, z);
    return tree;
}

const TREE_COUNT = 300;
const AREA_SIZE = 1000;

// Moon light side trees
for (let i = 0; i < TREE_COUNT; i++) {
    const x = THREE.MathUtils.randFloatSpread(AREA_SIZE);
    const z = THREE.MathUtils.randFloatSpread(AREA_SIZE);
    const tree = createLowPolyTree(x, 0, z);
    scene.add(tree);
}

// Sun light side trees
for (let i = 0; i < TREE_COUNT; i++) {
    const x = THREE.MathUtils.randFloatSpread(AREA_SIZE);
    const z = THREE.MathUtils.randFloatSpread(AREA_SIZE);

    const tree = createLowPolyTree(x, -.5, z);
    tree.rotation.x = Math.PI;
    scene.add(tree);
}

// -----------------------------------------------------------------------------

// Identity quaternion (0°)
const q0 = new THREE.Quaternion().set(0, 0, 0, 1);

 // 180° around X axis
const q180 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2);

function animate() {
  const delta = clock.getDelta();

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.01;
  mesh2.rotation.x += 0.01;
  mesh2.rotation.y += 0.01;

  // Light Rectagles look at camera
  let camerapos = camera.position;
  for (let i = 0; i < rectangles.length; i++) {
  rectangles[i].lookAt(camerapos);
  }

  // Scene Rotation
  scene.rotation.y += 0.0007;
  scene.rotation.z += 0.0006;
  scene.rotation.x += 0.0004;

    // Particle Explosion
  const pos = pointGeo.attributes.position.array;

    for (let i = 0; i < COUNT; i++) {
        const current = new THREE.Vector3(pos[i*3], pos[i*3+1], pos[i*3+2]);
        const target = targetState === "circle"
            ? circlePositions[i]
            : expandedPositions[i];

        // smooth movement toward target
        current.lerp(target, 0.01);

        pos[i*3] = current.x;
        pos[i*3+1] = current.y;
        pos[i*3+2] = current.z;
    }
    pointGeo.attributes.position.needsUpdate = true;

    // rotate sky shapes
    skyShapes.forEach(shape => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
        // shape.position.y += Math.sin(clock.getElapsedTime() + (Math.random() * Math.PI * 2)) * 0.5;

    });

  // controls.update();
  controls.update( delta );
  renderer.render(scene, camera);
  stats.update();
}