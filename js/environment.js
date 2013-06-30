
    var camera, cameraTarget, cameraDummy;
    var mouse;

    var scene, renderer;
    var textMesh,textObject;

    var angle = ( Math.PI * 2 ) / 10;
    var rotation = 0, rotationTarget = 0;


    var controls,time = Date.now();

    var UNITSIZE = 250, WINDOW_WIDTH, WINDOW_HEIGHT;

    var SEPARATION = 200,
          AMOUNTX = 10,
          AMOUNTY = 10

    init();
    animate();


    //LOADER
    var loader, loaderMesh

    function init() {

        WINDOW_WIDTH = window.innerWidth;
        WINDOW_HEIGHT = window.innerHeight;


        camera = new THREE.PerspectiveCamera( 75, WINDOW_WIDTH / WINDOW_HEIGHT, 1, 10000 );

        //http://www.aaronkoblin.com/Aaronetrope/js/Main.js
        cameraTarget = new THREE.Vector3( 0, 0, 0 );
        cameraDummy = new THREE.Object3D();
        cameraDummy.add( camera );

        camera.position.z = 50;
        console.log(camera);

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
        var container, separation = 100, amountX = 50, amountY = 50,
        particles, particle;

        var PI2 = Math.PI * 2;
        var material = new THREE.ParticleCanvasMaterial( {

          color: 0xffffff,
          program: function ( context ) {

            context.beginPath();
            context.arc( 0, 0, .2, 0, PI2, true );
            context.closePath();
            context.fill();

          }

        } );

        for ( var i = 0; i < 1000; i ++ ) {

          particle = new THREE.Particle( material );
          particle.position.x = Math.random() * 2 - 1;
          particle.position.y = Math.random() * 2 - 1;
          particle.position.z = Math.random() * 2 - 1;
          particle.position.normalize();
          particle.position.multiplyScalar( Math.random() * 10 + 600 ); //disabling this sets the dispersion from a single outwardly expanding point rather than a sphere

          initParticle( particle, i * 10 );

          scene.add( particle );

        }


        /* TEXT */

        var theText = "C  L  O  U  D  S";

        var text3d = new THREE.TextGeometry(theText, {
          size: 100,
          height: 20,
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
        scene.add( textObject );

        renderer = new THREE.CanvasRenderer();
        //renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.style.backgroundColor = '#000000';



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

        cameraDummy.position.x = Math.sin( rotation * angle ) * 700;
        cameraDummy.position.z = Math.cos( rotation * angle ) * 700;
        cameraDummy.rotation.y = rotation * angle;

        renderer.render( scene, camera );



    }

    function initParticle( particle, delay ) {

      var particle = this instanceof THREE.Particle ? this : particle;
      var delay = delay !== undefined ? delay : 0;

      particle.scale.x = particle.scale.y = Math.random() * 3 + 1;

      new TWEEN.Tween( particle )
        .delay( delay )
        .to( {}, 100000 )
        .onComplete( initParticle )
        .start();

      new TWEEN.Tween( particle.position )
        .delay( delay )
        .to( { x: Math.random() * 4000 - 2000, y: Math.random() * 1000 - 500, z: Math.random() * 4000 - 2000 }, 100000 )
        .start();

      new TWEEN.Tween( particle.scale )
        .delay( delay )
        .to( { x: 0, y: 0 }, 100000 )
        .start();

    }




var onDocumentMouseDown = function ( event ) {

  onDocumentMouseDownX = event.clientX;

  var onDocumentMouseMove = function ( event ) {

    document.body.style.cursor = 'move';

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;

    rotationTarget -= movementX * 0.005;

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
  console.log('move');
  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

};

document.body.appendChild( renderer.domElement );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
