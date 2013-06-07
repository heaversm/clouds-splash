
    var camera, scene, renderer;
    var textMesh,textObject;

    var controls,time = Date.now();

    var UNITSIZE = 250, WINDOW_WIDTH, WINDOW_HEIGHT;

    init();
    animate();

    function init() {

        WINDOW_WIDTH = window.innerWidth;
        WINDOW_HEIGHT = window.innerHeight;

        camera = new THREE.PerspectiveCamera( 75, WINDOW_WIDTH / WINDOW_HEIGHT, 1, 10000 );
        camera.position.z = 1000;
        console.log(camera);

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2( 0x18538b, .0005);

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

        /* FLOOR */
        var floor = new THREE.Mesh(
            new THREE.CubeGeometry( 2000, 2000, 20,4, 4 ),
            new THREE.MeshLambertMaterial({color: 0x161616})
        );
        floor.rotation.x = -90;
        floor.position.y = -20;
        scene.add(floor);

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
        textMesh.rotation.x = -.5;
        textObject = new THREE.Object3D();

        textObject.add( textMesh );
        scene.add( textObject );

        //renderer = new THREE.CanvasRenderer();
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.style.backgroundColor = '#212121';

        document.body.appendChild( renderer.domElement );

    }

    function animate() {

        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( animate );

        controls.update( Date.now() - time );

        renderer.render( scene, camera );

        time = Date.now();

    }



