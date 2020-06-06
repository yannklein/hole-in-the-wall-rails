import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initARJS } from './initAR';
import {initCSS3DRenderer, iFrameElement} from './initCSS3DRenderer';

let mouse = new THREE.Vector2();
let controls, controlsCSS3D;

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

const addBox = (x, y, z, size, myScene) => {
  const texture = new THREE.TextureLoader().load('images/yann.jpg');
  const geometry = new THREE.BoxBufferGeometry(size, size, size);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = size/2;
  mesh.position.set(x, mesh.position.y + y, z);
  myScene.add(mesh);
};

const addHoleInTheWall = (x, y, z, rx, ry, rz, size, myScene) => {
  var hole = new THREE.Group();
  // the inside of the hole
  let geometryHole = new THREE.CylinderGeometry(1, 1, 1, 32,1, true);
  let loader = new THREE.TextureLoader();
  let texture = loader.load( 'images/bricks.jpg' );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4,2);
  let materialHole = new THREE.MeshBasicMaterial({
    transparent : true,
    map: texture,
    side: THREE.BackSide
  });
  var holeInside = new THREE.Mesh( geometryHole, materialHole );
  holeInside.position.y = -0.6;
  hole.position.set(x, y, z);
  hole.rotation.set(rx, ry, rz);
  hole.scale.multiplyScalar(size);
  hole.add( holeInside );


  // the invisibility cloak (ring; has circular hole)
  let geometryCloak = new THREE.RingGeometry(1, 10, 32);
  let materialCloak = new THREE.MeshBasicMaterial({
    map: loader.load( 'images/bricks.jpg' ), // for testing placement
    colorWrite: true
  });
  var holeCloak = new THREE.Mesh( geometryCloak, materialCloak );
  holeCloak.rotation.x = -Math.PI/2;
  holeCloak.position.y -= 0.1;
  hole.add(holeCloak);

  myScene.add(hole);
};

const addYoutubeVideo = (id, x, y, z, rx, ry, rz, h, w, myScene) => {
  let youtubeObject = new iFrameElement(id, x, y, z, rx, ry, rz, h, w);
  myScene.add(youtubeObject);
  // Creating mesh to mix WebGL and CSS3D objects
  var material = new THREE.MeshPhongMaterial({
                opacity : 0.2,
                color : new THREE.Color('black'),
                blending: THREE.NoBlending,
                side  : THREE.DoubleSide,
            });
  // create the plane mesh
  var geometry = new THREE.PlaneGeometry(h,w);
  var planeMesh = new THREE.Mesh( geometry, material );

  planeMesh.position.copy(youtubeObject.position);
  planeMesh.rotation.copy(youtubeObject.rotation);
  // add it to the WebGL scene
  myScene.add(planeMesh);
};

const groundObject = (size, myScene) => {
  let geometry = new THREE.PlaneGeometry( size, size, 1 );
  const texture = new THREE.TextureLoader().load('images/table.jpg');
  let material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.DoubleSide} );
  let ground = new THREE.Mesh( geometry, material );
  ground.rotation.x = - Math.PI / 2;
  ground.position.y = -0.01;
  myScene.add(ground);
};

const init = (withAR = false, withCSS3D = false) => {
  // init renderer
  let rendererCSS3D, renderer;
  let onRenderFcts =[];

  if (withCSS3D) {
    rendererCSS3D = initCSS3DRenderer({
      antialias : true,
      autoResize : true,
      alpha: true
    });

    rendererCSS3D.setSize( window.innerWidth, window.innerHeight );
    rendererCSS3D.domElement.style.position = 'absolute';
    rendererCSS3D.domElement.style.top = '0px';
    rendererCSS3D.domElement.style.left = '0px';
    document.body.appendChild( rendererCSS3D.domElement );
  }

  renderer = new THREE.WebGLRenderer({
    antialias : true,
    autoResize : true,
    alpha: true
  });
  renderer.setClearColor( new THREE.Color('lightgrey'), 0);
  renderer.setPixelRatio( window.devicePixelRatio );

  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0px';
  renderer.domElement.style.left = '0px';
  document.body.appendChild( renderer.domElement );

  // Scene settings
  let scene = new THREE.Scene();

  // Create a camera
  let camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1500 );
  if (!withAR) {
    camera.position.z = 100;
    camera.position.y = 10;
  }
  scene.add(camera);

  let light = new THREE.AmbientLight( 0xffffff ); // soft white light
  light.intensity = 0.7;
  scene.add( light );

  // Control for non AR
  if (!withAR) {

    if (withCSS3D) {
      controlsCSS3D = new OrbitControls( camera, rendererCSS3D.domElement );
      controlsCSS3D.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      controlsCSS3D.dampingFactor = 0.25;
      controlsCSS3D.screenSpacePanning = false;
      controlsCSS3D.minDistance = 0;
      controlsCSS3D.maxDistance = 500;
      controlsCSS3D.maxPolarAngle = Math.PI / 2;
    }

    controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 0;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;

  }

  // Add objects to the ThreeJS scene
  let heightStr = (560).toString();
  let widthStr = (315).toString();

  const urlParams = new URLSearchParams(window.location.search);
  const youtubeParams = urlParams.get('ytid');
  console.log(`Youtube video ID: ${youtubeParams}`);

  if (withAR) {
    let sceneAR = initARJS(scene, camera, onRenderFcts, renderer);
    // addBox(1, sceneAR);
    if (withCSS3D) {
      addHoleInTheWall(0, 0, 0, 0, 0, 0, 1, sceneAR);
      addYoutubeVideo(youtubeParams, 0, -300, 0, -Math.PI / 2, 0, 0, heightStr, widthStr, sceneAR);
    }
  } else {
    addBox(0, 30, 0, 20, scene);
    groundObject(200, scene);
    if (withCSS3D) {
      addHoleInTheWall(0, 5, 0, Math.PI / 2, 0, 0, 5, scene);
      addYoutubeVideo(youtubeParams, 0, 0, -50, 0, 0, 0, heightStr, widthStr, scene);
    }
  }

  // render the scene
  onRenderFcts.push(function(){
    if (withCSS3D) { rendererCSS3D.render( scene, camera ); }
    renderer.render( scene, camera );
  });

  // run the rendering loop
  var lastTimeMsec = null;
  requestAnimationFrame(function animate(nowMsec){
    // keep looping
    requestAnimationFrame( animate );
    if (!withAR) {
      controls.update();
    }
    // measure time
    lastTimeMsec  = lastTimeMsec || nowMsec-1000/60;
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec  = nowMsec;
    // call each update function
    onRenderFcts.forEach(function(onRenderFct){
      onRenderFct(deltaMsec/1000, nowMsec/1000);
    });
  });

};


export { init };
