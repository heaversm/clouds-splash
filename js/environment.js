
    var camera, cameraTarget, cameraDummy;
    var mouse;

    var scene, renderer;
    var textMesh,textObject;

    var angle = ( Math.PI * 2 ) / 10;
    var rotation = 0, rotationTarget = 0;
    var movementX, movementX;
    var geometry,line;

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
      particleColor: [5,232,181]
    };
    var lineVars = {
      lineEveryXParticles: 7,
      lineColor: [5, 232, 181],
      lineOpacity: .1
    }

    var camControls = [];
    var particleControls = [];
    var lineControls = [];

    var textVars = { height: 1 };
    var renderVars = {
      updateCamera: function(){
        camera.updateProjectionMatrix();
      },
      updateParticles: function(){
        onUpdateParticles();
      },
      updateLines: function(){
        onUpdateLines();
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

        geometry = new THREE.Geometry();

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

          var lineIterator = i%particleVars;

          if (i%lineVars.lineEveryXParticles == 0){
            geometry.vertices.push( particle.position );
          }
          //geometry.vertices.push( particle.position );

          //initParticle( particle, i * 10); //the rate at which particles disperse (delay)
          initParticle( particle); //the rate at which particles disperse (delay)
          particles.push(particle);
          scene.add( particle );

        }

        var lineColor = setColor(lineVars.lineColor);

        line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: lineColor, opacity: lineVars.lineOpacity } ) );
        scene.add( line );


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
        var camFOV = camControls[0] = folderCamera.add(camera, 'fov',0,200);
        var camNear = camControls[1] = folderCamera.add(camera, 'near',1,500);
        var camFar = camControls[2] = folderCamera.add(camera, 'far',1000,10000);
        //folderCamera.add(renderVars,"updateCamera");
        //folderParticles.add(particleVars,"amount",500,2500);
        //folderParticles.add(particleVars,"dispersion",0,2000);
        var particleSmall = particleControls[0] = folderParticles.add(particleVars,"smallestSize",1,5);
        var particleLarge = particleControls[1] = folderParticles.add(particleVars,"largestSize",1,20);
        var particleRangeXNear = particleControls[2] = folderParticles.add(particleVars,"rangeXNear",0,4000);
        var particleRangeXFar = particleControls[3] = folderParticles.add(particleVars,"rangeXFar",0,8000);
        var particleRangeYNear = particleControls[4] = folderParticles.add(particleVars,"rangeYNear",0,4000);
        var particleRangeYFar = particleControls[5] = folderParticles.add(particleVars,"rangeYFar",0,8000);
        var particleRangeZNear = particleControls[6] = folderParticles.add(particleVars,"rangeZNear",0,4000);
        var particleRangeZFar = particleControls[7] = folderParticles.add(particleVars,"rangeZFar",0,8000);
        var particleLifespan = particleControls[8] = folderParticles.add(particleVars,"lifeSpan",1000,100000).step(1000);
        var particleColor = particleControls[9] = folderParticles.addColor(particleVars,"particleColor");
        //folderParticles.add(renderVars,"updateParticles");

        var lineOpacity = lineControls[0] = folderLines.add(line.material,"opacity",0,1);
        var lineOpacity = lineControls[1] = folderLines.addColor(lineVars,"lineColor");
        //folderLines.add(renderVars,"updateLines");

        //folderParticles.add(particleVars,"lineEveryXParticles",1,100);


        addControlListeners();

    }

    function addControlListeners(){
      for (var i=0;i<camControls.length;i++){
        camControls[i].onChange(function(){
          camera.updateProjectionMatrix();
        });
      }

      for (var j=0;j<particleControls.length;j++){ //color doesn't recognize onFinishChange
        if (j < particleControls.length-1){
          particleControls[j].onFinishChange(function(){
            onUpdateParticles();
          });
        } else if (j == particleControls.length-1) {
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

    function onUpdateLines(){
      line.material.opacity = lineVars.lineOpacity;
      var lineColor = updateColor(lineVars.lineColor);
      line.material.color.r = lineColor.r;
      line.material.color.g = lineColor.g;
      line.material.color.b = lineColor.b;
    }

    function onUpdateParticles(){
      //debugger;

      //generateParticle(particleVars.smallestSize,particleVars.largestSize);

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
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1; //ranges between -1 and 1, 0 being in the center
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
};

document.body.appendChild( renderer.domElement );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
