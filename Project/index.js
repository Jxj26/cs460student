import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

let render, scene, camera, controls;
let stats, meshKnot;
let rectangles = [];


const clock = new THREE.Clock();
const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({antialias: true });
renderer.setSize(w, h);
renderer.setAnimationLoop( animate );

document.body.appendChild(renderer.domElement);

// setup camera
const fov = 75;
const aspect = w / h;
const znear = 1;
const zfar = 1000;
camera = new THREE.PerspectiveCamera(fov, aspect, znear, zfar);
camera.position.set(20, 10, -35);
camera.rotateY(Math.PI);
camera.rotateX(0);
scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 'lightblue', 0.005 );


// Basic Material Torus
const geo = new THREE.TorusKnotGeometry(10, 5, 100, 16);
const material = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0, metalness: 0 } );
const mesh = new THREE.Mesh(geo, material);
mesh.position.set(0, 100, 0);
scene.add(mesh);

// Standard Material torus
const geoKnot = new THREE.TorusKnotGeometry( 1.5, 0.5, 200, 16 );
const matKnot = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0, metalness: 0 } );
meshKnot = new THREE.Mesh( geoKnot, matKnot );
meshKnot.position.set( 0, 5, 0 );
scene.add( meshKnot );

RectAreaLightUniformsLib.init();


// Creates Rectangles lights side by side, x is the number of lights and y is y position
// 10 units aparts in the x direction
const CreateLightRectArray = (x, y) => {
  
  for (let i = 0; i < x; i++) {
    //let color = vector
    let rect = new THREE.RectAreaLight(0xffffff, 5, 4, 10);
    rectangles.push(rect);
    rect.position.set((i * 10), (1 * y), 5);
    scene.add(rect);
    scene.add( new RectAreaLightHelper( rect ) );
  }
}
CreateLightRectArray(5, 5);
CreateLightRectArray(5,20);



const geometry = new THREE.BufferGeometry();
const vertices = [];

for ( let i = 0; i < 10000; i ++ ) {

	vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
	vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
	vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z

}

geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
const particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
scene.add( particles );



// Orbit controls
// const controls = new OrbitControls( camera, renderer.domElement );


//first person controls
controls = new FirstPersonControls( camera, renderer.domElement );
controls.activeLook = true;
controls.movementSpeed = 50;
controls.lookSpeed = 0.1;

// Floor
const geoFloor = new THREE.BoxGeometry( 2000, 0.1, 2000 );
const matStdFloor = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, roughness: 0.1, metalness: 0 } );
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

stats = new Stats();
document.body.appendChild( stats.dom );




// --- particle count ---
const COUNT = 500;

// particle geometry
const geometry2 = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT * 3);
geometry2.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const material2 = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
});

const points = new THREE.Points(geometry2, material2);
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

// --- control target state ---
let targetState = "circle"; // "circle" or "expanded"

// --- key controls ---
window.addEventListener("keydown", (e) => {
    if (e.key === "q") targetState = "expanded";
    if (e.key === "e") targetState = "circle";
});








// Identity quaternion (0°)
const q0 = new THREE.Quaternion().set(0, 0, 0, 1);

 // 180° around X axis
const q180 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2);

function animate() {
  
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.01;
  let camerapos = camera.position;

  for (let i = 0; i < rectangles.length; i++) {
   // rectangles[i].rotateX(Math.PI/2);
  //rectangles[i].quaternion.slerp(q180, 0.1);
  rectangles[i].lookAt(camerapos);
  // rectangles[i].position.copy(camerapos);
  }




  const pos = geometry.attributes.position.array;

    for (let i = 0; i < COUNT; i++) {
        const current = new THREE.Vector3(pos[i*3], pos[i*3+1], pos[i*3+2]);
        const target = targetState === "circle"
            ? circlePositions[i]
            : expandedPositions[i];

        // smooth movement toward target
        current.lerp(target, 0.05);

        pos[i*3] = current.x;
        pos[i*3+1] = current.y;
        pos[i*3+2] = current.z;
    }

    geometry.attributes.position.needsUpdate = true;




  // controls.update();
  controls.update( clock.getDelta() );
  renderer.render(scene, camera);
  stats.update();

}