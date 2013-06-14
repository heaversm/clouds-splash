
    var camera, scene, renderer;
    var textMesh,textObject;

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
        camera.position.z = 1000;
        console.log(camera);

        scene = new THREE.Scene();


        var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
        light.position.set( 1, 1, 1 );
        scene.add( light );

        var light = new THREE.DirectionalLight( 0xffffff, 0.75 );
        light.position.set( -1, - 0.5, -1 );
        scene.add( light );

        /* CONTROLS */
        controls = new THREE.PointerLockControls( camera );
        controls.enabled = true;
        scene.add( controls.getObject() );

        /* CLOUD */
        var container, separation = 100, amountX = 50, amountY = 50,
        particles, particle;

        var PI2 = Math.PI * 2;
        var material = new THREE.ParticleBasicMaterial( {

          color: 0xffffff,
          program: function ( context ) {

            context.beginPath();
            context.arc( 0, 0, 1, 0, PI2, true );
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
          particle.position.multiplyScalar( Math.random() * 10 + 600 );

          initParticle( particle, i * 10 );

          scene.add( particle );

        }


        /* TEXT */

        var theText = "C  L  O  U  D  S";

        var text3d = new THREE.TextGeometry(theText, {
          size: 100,
          height: 20,
          curveSegments: 5,
          font: "bender"  //change this
        });

        text3d.computeBoundingBox();
        var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

        textMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
        textMesh = new THREE.Mesh( text3d, textMaterial );
        textMesh.position.x = centerOffset;
        textObject = new THREE.Object3D();

        textObject.add( textMesh );
        scene.add( textObject );

        /* TEXT 2 */
        /*loader = new THREE.JSONLoader();

        loader.load( "js/clouds-text.js", function( geometry ) {
            loaderMesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
            loaderMesh.scale.set( 50, 50, 50 );
            loaderMesh.position.y = 0;
            loaderMesh.position.x = 0;
            loaderMesh.position.z = 0;
            scene.add( loaderMesh );
            animate();
        } );*/

        renderer = new THREE.CanvasRenderer();
        //renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.style.backgroundColor = '#000000';

        document.body.appendChild( renderer.domElement );



    }

    function animate() {

        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( animate );

        controls.update( Date.now() - time );

        TWEEN.update();
        renderer.render( scene, camera );

        time = Date.now();

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

