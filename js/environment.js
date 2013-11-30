
  var camera, cameraTarget, cameraDummy;
  var mouse;

  var scene, renderer;
  var textMesh,textObject;

  var angle = ( Math.PI * 2 ) / 10;
  var rotation = 0, rotationTarget = 0;
  var movementX, movementX;
  var geometry1,geometry2,geometry3,line1,line2,line3; //lines2

  /* GUI VARS */
  var particles = [];

  var cameraVars = { fov: 70, near: 100, far: 5000, xRange: 1, yRange: 1 };
  var particleVars = {
    amount: 1500,
    dispersion: 800,
    smallestSize: 1,
    largestSize: 3,
    rangeXNear: 2000,
    rangeXFar: 4000,
    rangeYNear: 2000,
    rangeYFar: 4000,
    rangeZNear: 2000,
    rangeZFar: 4000,
    lifeSpan: 10000,
    particleColor: [232,245,242],
    updateColor: function(){ onUpdateParticles(); }
};

var lineVars = {
  lineEveryXParticles: 45,
  line1Color: [109, 186, 202],
  line2Color: [28,102,118],
  line3Color: [97,207,230],
  line1Opacity: .5,
  line2Opacity: .5,
  line3Opacity: .5
}

var camControls = [];
var particleControls = [];
var lineControls = [];

var textVars = { height: 1 };

var controls,time = Date.now();

init();
animate();


//LOADER
var loader, loaderMesh

function init() {

    WINDOW_WIDTH = window.innerWidth;
    WINDOW_HEIGHT = window.innerHeight;


    camera = new THREE.PerspectiveCamera( cameraVars.fov, WINDOW_WIDTH / WINDOW_HEIGHT, cameraVars.near, cameraVars.far ); //set FOV to widen / narrow view

    //http://www.aaronkoblin.com/Aaronetrope/js/Main.js
    cameraTarget = new THREE.Vector3( 0, 0, -1500 );
    cameraDummy = new THREE.Object3D();
    cameraDummy.position.set( Math.sin( 0 ) * 1500, 0, Math.cos( 0 ) * 1500 );
    cameraDummy.add( camera );

    scene = new THREE.Scene();
    scene.add( cameraDummy );


    mouse = new THREE.Vector2();


    var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    var light = new THREE.DirectionalLight( 0xffffff, 0.75 );
    light.position.set( -1, - 0.5, -1 );
    scene.add( light );

    /* CLOUD */

    var PI2 = Math.PI * 2;
    var particleColor = setColor(particleVars.particleColor);
    var material = new THREE.ParticleCanvasMaterial( {

    color: particleColor,
    program: function ( context ) {

        context.beginPath();
        context.arc( 0, 0, .2, 0, PI2, true ); //the size of the particle
        context.closePath();
        context.fill();

      }

    } );

    geometry1 = new THREE.Geometry();
    geometry2 = new THREE.Geometry();
    geometry3 = new THREE.Geometry();

    for ( var i = 0; i < particleVars.amount; i ++ ) {

      particle = new THREE.Particle( material );

      var sphereCoords = generateSphericalPosition();

      particle.position.x = sphereCoords.x;
      particle.position.y = sphereCoords.y;
      particle.position.z = sphereCoords.z;
      particle.position.normalize();
      particle.position.multiplyScalar( Math.random() * 10 + particleVars.dispersion ); //disabling this sets the dispersion from a single outwardly expanding point rather than a sphere. Added number is the radius of the sphere

      particle.originX = particle.position.x; //keep track of starting coordinates for implode
      particle.originY= particle.position.y;
      particle.originZ = particle.position.z;

      if (i%lineVars.lineEveryXParticles == 0){
        geometry1.vertices.push( particle.position );
      } else if (i%lineVars.lineEveryXParticles == 1){
        geometry2.vertices.push( particle.position);
      } else if (i%lineVars.lineEveryXParticles == 3){
        geometry3.vertices.push( particle.position );
      }

      //initParticle( particle, i * 10); //the rate at which particles disperse (delay)
      initParticle( particle,i); //the rate at which particles disperse (delay)
      particles.push( particle );
      scene.add( particle );

    }

    var line1Color = setColor(lineVars.line1Color);
    var line2Color = setColor(lineVars.line2Color);
    var line3Color = setColor(lineVars.line3Color);

    line1 = new THREE.Line( geometry1, new THREE.LineBasicMaterial( { color: line1Color, opacity: lineVars.line1Opacity } ) );
    line2 = new THREE.Line( geometry2, new THREE.LineBasicMaterial( { color: line2Color, opacity: lineVars.line2Opacity } ) );
    line3 = new THREE.Line( geometry3, new THREE.LineBasicMaterial( { color: line3Color, opacity: lineVars.line3Opacity } ) );
    scene.add ( line1 );
    scene.add ( line2 );
    scene.add ( line3 );


    /* TEXT */

    var theText = "C    L    O    U    D    S";

    var text3d = new THREE.TextGeometry(theText, {
      size: 100,
      height: 1,
      curveSegments: 5,
      font: "materiapro"  //change this
    });

    text3d.computeBoundingBox();
    var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

    textMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    textMesh = new THREE.Mesh( text3d, textMaterial );
    textMesh.position.x = centerOffset;
    textObject = new THREE.Object3D();

    textObject.add( textMesh );
    //textObject.position.z = -1000;
    scene.add( textObject );

    renderer = new THREE.CanvasRenderer();
    //renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.backgroundColor = '#000000';

    /* GUI */
    var gui = new dat.GUI();
    var folderCamera = gui.addFolder('Camera');
    var folderParticles = gui.addFolder('Particles');
    var folderLines = gui.addFolder("Lines");

    camControls[0] = folderCamera.add(camera, 'fov',50,175);
    camControls[1] = folderCamera.add(camera, 'near',1,500);
    camControls[2] = folderCamera.add(camera, 'far',1000,10000);
    camControls[3] = folderCamera.add(cameraVars, 'xRange',0,10).step(1);
    camControls[4] = folderCamera.add(cameraVars, 'yRange',0,10).step(1);

    particleControls[0] = folderParticles.add(particleVars,"smallestSize",1,5);
    particleControls[1] = folderParticles.add(particleVars,"largestSize",1,20);
    particleControls[2] = folderParticles.add(particleVars,"rangeXNear",0,4000);
    particleControls[3] = folderParticles.add(particleVars,"rangeXFar",0,8000);
    particleControls[4] = folderParticles.add(particleVars,"rangeYNear",0,4000);
    particleControls[5] = folderParticles.add(particleVars,"rangeYFar",0,8000);
    particleControls[6] = folderParticles.add(particleVars,"rangeZNear",0,4000);
    particleControls[7] = folderParticles.add(particleVars,"rangeZFar",0,8000);
    particleControls[8] = folderParticles.add(particleVars,"lifeSpan",1000,100000).step(1000);
    particleControls[9] = folderParticles.addColor(particleVars,"particleColor");
    particleControls[10] = folderParticles.add(particleVars,"updateColor");

    lineControls[0] = folderLines.add(lineVars,"line1Opacity",0,1);
    lineControls[1] = folderLines.add(lineVars,"line2Opacity",0,1);
    lineControls[2] = folderLines.add(lineVars,"line3Opacity",0,1);
    lineControls[3] = folderLines.addColor(lineVars,"line1Color");
    lineControls[4] = folderLines.addColor(lineVars,"line2Color");
    lineControls[5] = folderLines.addColor(lineVars,"line3Color");

    addControlListeners();
    addKeyListeners();
    addLineAnimations();

}

  function addControlListeners(){
    for (var i=0;i<camControls.length;i++){
      camControls[i].onChange(function(){
        onUpdateCamera();
      });
    }

    for (var j=0;j<particleControls.length;j++){
      if (j < particleControls.length-2){ //color doesn't recognize onFinishChange, all others do
        particleControls[j].onFinishChange(function(){
          onUpdateParticles();
        });
      } else if (j == particleControls.length-1) { //require click of "update" to change color for performance reasons
        particleControls[j].onChange(function(){
          onUpdateParticles();
        });
      }
    }

    for (var k = 0; k< lineControls.length;k++){
      lineControls[k].onChange(function(){
        onUpdateLines();
      });
    }

  }

  function addKeyListeners(){
    document.onkeydown = function(event) {

       if (!event){
        event = window.event;
       }

       var code = event.keyCode;
       if (event.charCode && code == 0){
        code = event.charCode;
       }

       switch(code) {
          case 37:
              //keyLeft();
              break;
          case 38: //up
          case 87:
              decreaseFOV();
              break;
          case 39:
              //keyRight();
              break;
          case 40: //down
          case 83:
              increaseFOV();
              break;
       }
       event.preventDefault();
    };
  }

  function addLineAnimations(){

      var opacity1 = Math.min(Math.random(), lineVars.line1Opacity);
      var opacity2 = Math.min(Math.random(), lineVars.line2Opacity);
      var opacity3 = Math.min(Math.random(), lineVars.line3Opacity);

      line1.lineTween = new TWEEN.Tween( line1.material )
      .to( { opacity: opacity1 }, 2000 )
      .onComplete(function(){
        TWEEN.remove(line1.lineTween);
        TWEEN.remove(line2.lineTween);
        TWEEN.remove(line3.lineTween);
        addLineAnimations();
      })
      .start();

      line2.lineTween = new TWEEN.Tween( line2.material )
      .to( { opacity: opacity2 }, 2000 )
      .start();

      line3.lineTween = new TWEEN.Tween( line3.material )
      .to( { opacity: opacity3 }, 2000 )
      .start();

  }

  function increaseFOV(){
    console.log('ifov');
    var fovVal = camControls[0].getValue();
    fovVal+=5;
    camControls[0].setValue(fovVal);
  }

  function decreaseFOV(){
    var fovVal = camControls[0].getValue();
    fovVal-=5;
    camControls[0].setValue(fovVal);
  }

  function animate() {

      // note: three.js includes requestAnimationFrame shim
      requestAnimationFrame( animate );
      TWEEN.update();

      var x = mouse.x * 100.0;
      var y = mouse.y * 100.0;

      camera.position.x += ( x - camera.position.x ) * 0.1;
      camera.position.y += ( y - camera.position.y ) * 0.1;
      camera.lookAt( cameraTarget );

      rotation += ( rotationTarget - rotation ) * 0.1;

      cameraDummy.position.x = Math.sin( rotation * angle ) * 1500;
      cameraDummy.position.z = Math.cos( rotation * angle ) * 1500;
      cameraDummy.rotation.y = rotation * angle;

      renderer.render( scene, camera );

  }

  function initParticle( particle, index ) {

    var particle = this instanceof THREE.Particle ? this : particle;
    var delay = delay !== undefined ? delay : 0;

    generateParticle(particle,particleVars.smallestSize,particleVars.largestSize);

    explode(particle,index);

  }

  function setColor(colorArray){
    var newColor = 'rgb(' + colorArray[0] + ',' + colorArray[1] + ',' + colorArray[2] + ')';
    return newColor;
  }

  function updateColor(colorArray){
    var colorR = colorArray[0]/255;
    var colorG = colorArray[1]/255;
    var colorB = colorArray[2]/255;

    var colorObject = {"r":colorR,"g":colorG,"b":colorB};
    return colorObject;

  }

  function generateParticle(particle,min,max){
    particle.scale.x = particle.scale.y = Math.random() * max + min;
  }

  function generateSphericalPosition(){
    var sphereCoords = {};
    sphereCoords.x = Math.random() * 2 - 1;
    sphereCoords.y = Math.random() * 2 - 1;
    sphereCoords.z = Math.random() * 2 - 1;

    return sphereCoords;
  }

  function explode(particle,index){

    particle.particleTween = new TWEEN.Tween( particle.position )
      .delay( index  )
      .to( { x: Math.random() * particleVars.rangeXFar - particleVars.rangeXNear, y: Math.random() * particleVars.rangeYFar - particleVars.rangeYNear, z: Math.random() * particleVars.rangeZFar - particleVars.rangeZNear }, 2000 )
      .onComplete(function(){
        //implode(particle);
        particle.position.x = particle.originX,
        particle.position.y = particle.originY,
        particle.position.z = particle.originZ,
        explode(particle,index);
      })
      .start();
  }

  function implode(particle){

    particle.particleTween = new TWEEN.Tween( particle.position )
      .delay( 2000 )
      .to( { x: particle.originX, y: particle.originY, z: particle.originZ }, Math.random()*2000)
      .onComplete(function(){
        explode(particle);
      })
      .start();
  }

  function onUpdateCamera(){
    camera.updateProjectionMatrix();
  }

  function onUpdateLines(){

    var line1Color = updateColor(lineVars.line1Color);
    line1.material.color.r = line1Color.r;
    line1.material.color.g = line1Color.g;
    line1.material.color.b = line1Color.b;

    var line1Color = updateColor(lineVars.line1Color);
    line1.material.color.r = line1Color.r;
    line1.material.color.g = line1Color.g;
    line1.material.color.b = line1Color.b;

    var line2Color = updateColor(lineVars.line2Color);
    line2.material.color.r = line2Color.r;
    line2.material.color.g = line2Color.g;
    line2.material.color.b = line2Color.b;

    var line3Color = updateColor(lineVars.line3Color);
    line3.material.color.r = line3Color.r;
    line3.material.color.g = line3Color.g;
    line3.material.color.b = line3Color.b;
  }

  function onUpdateParticles(){

    for (var i=0;i<particles.length-1;i++){
      var particleColor = updateColor(particleVars.particleColor);
      particles[i].material.color.r = particleColor.r;
      particles[i].material.color.g = particleColor.g;
      particles[i].material.color.b = particleColor.b;

      generateParticle(particles[i],particleVars.smallestSize,particleVars.largestSize);
      particles[i].particleTween.to( { x: Math.random() * particleVars.rangeXFar - particleVars.rangeXNear, y: Math.random() * particleVars.rangeYFar - particleVars.rangeYNear, z: Math.random() * particleVars.rangeZFar - particleVars.rangeZNear }, particleVars.lifeSpan ).start();
    }

  }


var onDocumentMouseDown = function ( event ) {

onDocumentMouseDownX = event.clientX;

var onDocumentMouseMove = function ( event ) {

  document.body.style.cursor = 'move';

  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  /*var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;*/

  rotationTarget -= movementX * 0.001; //adjust to change maximum distance we can rotate around the text

};

var onDocumentMouseUp = function ( event ) {

  document.body.style.cursor = 'pointer';

  document.removeEventListener( 'mousemove', onDocumentMouseMove );
  document.removeEventListener( 'mouseup', onDocumentMouseUp );

};

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mouseup', onDocumentMouseUp, false );

};

var onDocumentMouseMove = function ( event ) {
event.preventDefault();
var percentX = (event.clientX / window.innerWidth); //ranges between 0 and 1;
var percentY =(event.clientY / window.innerHeight);

mouse.x = percentX*cameraVars.xRange - (cameraVars.xRange/2);
mouse.y = percentY*cameraVars.yRange - (cameraVars.yRange/2);
//mouse.x = (( event.clientX / window.innerWidth ) * 50)-50; //ranges between -1 and 1, 0 being in the center
//mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
};

document.body.appendChild( renderer.domElement );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
