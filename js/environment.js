
    var camera, cameraTarget, cameraDummy;
    var mouse;

    var scene, renderer;
    var textMesh,textObject;

    var angle = ( Math.PI * 2 ) / 10;
    var rotation = 0, rotationTarget = 0;
    var movementX, movementX;
    var geometry;

    /* GUI VARS */
    var particles = [];

    var cameraVars = { fov: 70, near: 100, far: 5000 };
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
    };
    var textVars = { height: 1 };
    var renderVars = {
      updateCamera: function(){
        camera.updateProjectionMatrix();
      },
      updateParticles: function(){
        onUpdateParticles();
      }
    }

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
        var material = new THREE.ParticleCanvasMaterial( {

          color: 0xffffff,
          program: function ( context ) {

            context.beginPath();
            context.arc( 0, 0, .2, 0, PI2, true ); //the size of the particle
            context.closePath();
            context.fill();

          }

        } );

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

          //initParticle( particle, i * 10); //the rate at which particles disperse (delay)
          initParticle( particle); //the rate at which particles disperse (delay)
          particles.push(particle);
          scene.add( particle );

        }


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
        folderCamera.add(camera, 'fov',0,200);
        folderCamera.add(camera, 'near',1,500);
        folderCamera.add(camera, 'far',1000,10000);
        folderCamera.add(renderVars,"updateCamera");
        //folderParticles.add(particleVars,"amount",500,2500);
        //folderParticles.add(particleVars,"dispersion",0,2000);
        folderParticles.add(particleVars,"smallestSize",1,5);
        folderParticles.add(particleVars,"largestSize",1,20);
        folderParticles.add(particleVars,"rangeXNear",0,4000);
        folderParticles.add(particleVars,"rangeXFar",0,8000);
        folderParticles.add(particleVars,"rangeYNear",0,4000);
        folderParticles.add(particleVars,"rangeYFar",0,8000);
        folderParticles.add(particleVars,"rangeZNear",0,4000);
        folderParticles.add(particleVars,"rangeZFar",0,8000);
        folderParticles.add(particleVars,"lifeSpan",1000,100000).step(1000);
        folderParticles.add(renderVars,"updateParticles");

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


        // cameraTarget.x += ( x - cameraTarget.x ) * 0.1;
        // cameraTarget.y += ( y - cameraTarget.y ) * 0.1;


        renderer.render( scene, camera );

    }

    function initParticle( particle, delay ) {

      var particle = this instanceof THREE.Particle ? this : particle;
      var delay = delay !== undefined ? delay : 0;

      generateParticle(particle,particleVars.smallestSize,particleVars.largestSize);
      //particle.scale.x = particle.scale.y = Math.random() * particleVars.largestSize + particleVars.smallestSize; //variance in particle scale

      explode(particle);




      /*new TWEEN.Tween( particle.scale )
        .delay( delay )
        .to( { x: 0, y: 0 }, 100000 )
        .start();*/

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

    function explode(particle){
      particle.particleTween = new TWEEN.Tween( particle.position )
        .delay( 2000 )
        .to( { x: Math.random() * particleVars.rangeXFar - particleVars.rangeXNear, y: Math.random() * particleVars.rangeYFar - particleVars.rangeYNear, z: Math.random() * particleVars.rangeZFar - particleVars.rangeZNear }, 2000 )
        .onComplete(function(){
          implode(particle);
        })
        //.onUpdate(function(){ onUpdateParticles(); })
        .start();
    }

    function implode(particle){

      particle.particleTween = new TWEEN.Tween( particle.position )
        .delay( 2000 )
        .to( { x: particle.originX, y: particle.originY, z: particle.originZ }, Math.random()*2000)
        .onComplete(function(){
          //console.log('implode complete');
          explode(particle);
        })
        //.onUpdate(function(){ onUpdateParticles(); })
        .start();
    }

    function onUpdateParticles(){

      //generateParticle(particleVars.smallestSize,particleVars.largestSize);

      for (var i=0;i<particles.length;i++){
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
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1; //ranges between -1 and 1, 0 being in the center
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
};

document.body.appendChild( renderer.domElement );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
