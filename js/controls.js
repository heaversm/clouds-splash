/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( camera ) {

  var scope = this;
  var MOVESPEED = .9;

  var pitchObject = new THREE.Object3D();
  pitchObject.rotation.x = -.004;

  pitchObject.add( camera );

  var yawObject = new THREE.Object3D();
  yawObject.position.y = 10;
  yawObject.add( pitchObject );

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;
  var craneUp = false;
  var craneDown = false;
  var pitchX = true;

  var velocity = new THREE.Vector3();

  var PI_2 = Math.PI / 2;

  var mouseIsDown = false;

  var onMouseDown = function(event){
    mouseIsDown = true;
  }

  var onMouseUp = function(event){
    mouseIsDown = false;
  }

  var onMouseMove = function ( event ) {

    if (mouseIsDown){

      if ( scope.enabled === false ) return;

      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      yawObject.rotation.y -= movementX * 0.001;

      pitchObject.rotation.x -= movementY * 0.001;
      pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );


    }

  };

  var onKeyDown = function ( event ) {

    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = true;
        break;

      case 37: // left
      case 65: // a
        moveLeft = true; break;

      case 40: // down
      case 83: // s
        moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        moveRight = true;
        break;

      case 69: //e
        craneUp = true;
        break;

      case 67: //c
        craneDown = true;
        break;
    }

  };

  var onKeyUp = function ( event ) {

    switch( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = false;
        break;

      case 37: // left
      case 65: // a
        moveLeft = false;
        break;

      case 40: // down
      case 83: // a
        moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        moveRight = false;
        break;

        case 69: //e
        craneUp = false;
        break;

      case 67: //c
        craneDown = false;
        break;

    }

  };

  document.addEventListener( 'mousemove', onMouseMove, false );
  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
  document.addEventListener('mousedown',onMouseDown,false);
  document.addEventListener('mouseup',onMouseUp,false);

  this.enabled = false;

  this.getObject = function () {

    return yawObject;

  };

  this.update = function ( delta ) {

    if ( scope.enabled === false ) return;

    delta *= 0.1;

    velocity.x += ( - velocity.x ) * 0.08 * delta;
    velocity.z += ( - velocity.z ) * 0.08 * delta;

    velocity.y -= 0.25 * delta;

    if ( moveForward ){
      velocity.z -= MOVESPEED * delta;
    }

    if ( moveBackward ){
      velocity.z += MOVESPEED * delta;
    }

    if ( moveLeft ){
      velocity.x -= MOVESPEED * delta;
    }

    if ( moveRight ){
      velocity.x += MOVESPEED * delta;
    }

    yawObject.translateX( velocity.x );
    yawObject.translateY( velocity.y );
    yawObject.translateZ( velocity.z );

    if ( yawObject.position.y < 10 ) {
      velocity.y = 0;
      yawObject.position.y = 10;
    }

    /*if (yawObject.position.z < -900){
      velocity.z = 0;
      yawObject.position.z = -900;
    } else if (yawObject.position.z > 100){
      velocity.z = 0;
      yawObject.position.z = 100;
    }*/

  };

};
