var scene, camera, renderer;
var gridGeo, GridMat, grid, gridEdge;
var bgGeo, bgMat, bg;
var textureAnim, datboi, waddupTime;
var timetrack = 0.01;
var composer, glitchPass;
var clock = new THREE.Clock();
var isScroll = false;

init();
animate();

function init() {
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 115;
  camera.position.y = 490;

  // Grid
  gridGeo = new THREE.SphereGeometry( 500, 359,179);
  gridMat = new THREE.MeshPhongMaterial( { color: 0x000000 } );
  grid = new THREE.Mesh( gridGeo, gridMat );
  gridEdge = new THREE.EdgesHelper(grid, 0xaaaaff);
  gridEdge.material.linewidth = 3;
  grid.rotateZ(1/2*Math.PI);
  scene.add(grid);
  scene.add(gridEdge);

  // Skydome
  var loader = new THREE.TextureLoader();
  loader.setCrossOrigin('');
  var uniforms = {  
    texture: {
      type: 't',
      value: loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/milk.jpg')
    }
  };
  bgMat = new THREE.ShaderMaterial( {  
    uniforms: uniforms,
    vertexShader: document.getElementById('sky-vertex').textContent,
    fragmentShader: document.getElementById('sky-fragment').textContent
  });
  bgGeo = new THREE.SphereGeometry(10000, 60, 40);
  bg = new THREE.Mesh(bgGeo, bgMat);
  bg.renderDepth = 1000.0;  
  bg.material.side = THREE.BackSide;
  bg.rotateZ(1/4*Math.PI);
  bg.rotateY(1/4*Math.PI);
  scene.add(bg);

  var boiLoader = new THREE.TextureLoader();
  boiLoader.setCrossOrigin('');
  boiLoader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/datboi.png", function(tex) {
    textureAnim = new TextureAnimator(tex, 5, 1, 10, 100); // texture, #horiz, #vert, #total, duration.
    var mat = new THREE.MeshBasicMaterial({map: tex, transparent: true, side:THREE.DoubleSide});
    var geo = new THREE.PlaneGeometry(10, 10, 1, 1);
    datboi = new THREE.Mesh(geo, mat);
    datboi.position.z = 505*Math.cos(timetrack/3);
    datboi.position.y = -505*Math.sin(timetrack/3);
    datboi.position.x = 5;
    datboi.rotation.x = timetrack/3 + 90;
    scene.add(datboi);
  });
  
  // Render
  renderer = new THREE.WebGLRenderer({antialias:true, alpha: false});
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  composer = new THREE.EffectComposer( renderer );
  composer.addPass( new THREE.RenderPass( scene, camera ) );
  glitchPass = new THREE.GlitchPass();
  glitchPass.renderToScreen = true;
  composer.addPass( glitchPass );

  // Add to body
  document.body.appendChild( renderer.domElement );

  // Kinda responsive
  window.addEventListener( 'resize', onWindowResize, false );
}

function render() {
  renderer.render( scene, camera );
}

function animate() {
  requestAnimationFrame(animate);
  if (!isScroll){
    grid.rotation.x += 0.0016;
    bg.rotation.x += 0.0016;
    render();
    update();
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}

function update() {
  timetrack += 0.01;
  var delta = clock.getDelta(); 
  textureAnim.update(1000 * delta);
  datboi.position.z = 504*Math.cos(timetrack/3);
  datboi.position.y = -504*Math.sin(timetrack/3);
  datboi.rotation.x = timetrack/3 + 90;
  if (datboi.position.z > 108 && datboi.position.z < 115 && datboi.position.y > 0) {
    isScroll = true;
    glitchPass.goWild = true;
    document.getElementById('OHSHIT').style.display = 'flex';
    composer.render();
    window.clearTimeout(waddupTime);
    waddupTime = window.setTimeout(function() {
      isScroll = false;
      glitchPass.goWild = false;
    }, 1000);
  } else {
    document.getElementById('OHSHIT').style.display = 'none';
  }
}

/****************************
Texture Animation Function From:
https://stemkoski.github.io/Three.js/Texture-Animation.html
****************************/
function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) 
{	
  // note: texture passed by reference, will be updated by the update function.

  this.tilesHorizontal = tilesHoriz;
  this.tilesVertical = tilesVert;
  // how many images does this spritesheet contain?
  //  usually equals tilesHoriz * tilesVert, but not necessarily,
  //  if there at blank tiles at the bottom of the spritesheet. 
  this.numberOfTiles = numTiles;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
  texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

  // how long should each image be displayed?
  this.tileDisplayDuration = tileDispDuration;

  // how long has the current image been displayed?
  this.currentDisplayTime = 0;

  // which image is currently being displayed?
  this.currentTile = 0;

  this.update = function( milliSec )
  {
    this.currentDisplayTime += milliSec;
    while (this.currentDisplayTime > this.tileDisplayDuration)
    {
      this.currentDisplayTime -= this.tileDisplayDuration;
      this.currentTile++;
      if (this.currentTile == this.numberOfTiles)
        this.currentTile = 0;
      var currentColumn = this.currentTile % this.tilesHorizontal;
      texture.offset.x = currentColumn / this.tilesHorizontal;
      var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
      texture.offset.y = currentRow / this.tilesVertical;
    }
  };
}