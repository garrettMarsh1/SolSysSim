import * as THREE from 'three';
export default class Controls {
  constructor(camera) {
    this.camera = camera;

    //this.camera.position.set(34381892.532413535-80000,144958862.40301177-10000, 10000 );
    this.camera.rotation.set(0, 0, 0);
    //this.camera.lookAt(0, 0, 0);

    this.velocity = new THREE.Vector3();
    this.rotation = new THREE.Quaternion();
    this.rotation.setFromEuler(this.camera.rotation);

    document.addEventListener('keydown', event => {
      switch (event.keyCode) {
        case 87: // W key
          this.velocity.z -= .15; 
          break;
        case 83: // S key
          this.velocity.z += 1; 
          break;
        case 65: // A keys
          this.velocity.x -= .01; 
          break;
        case 68: // D key
          this.velocity.x += .01; 
          break;
        case 81: // Q key
            this.velocity.y += .03; 
            break;
        case 69: // E key
            this.velocity.y -= .03; 
            break;
        

      }
    });

    document.addEventListener('keyup', event => {
      switch (event.keyCode) {
        case 87: // W key
          this.velocity.z += .05; 
          break;
        case 83: // S key
          this.velocity.z -= 1; 
          break;
        case 65: // A key
          this.velocity.x += .01; 
          break;
        case 68: // D key
          this.velocity.x -= .01; 
          break;
        case 81: // Q key
            this.velocity.y -= .03; 
            break;
        case 69: // E key
            this.velocity.y += .03; 
            break;
        
            
      }
    });
  }

  update(dt) {
    const direction = this.velocity.clone().normalize();
  
    if (direction.lengthSq() > 0) {
      const target = new THREE.Vector3().addVectors(this.camera.position, direction);
      this.rotation.setFromRotationMatrix(new THREE.Matrix4().lookAt(this.camera.position, target, this.camera.up));
    }
  
    this.camera.position.lerp(this.camera.position.clone().add(this.velocity), .1);
    this.camera.quaternion.slerp(this.rotation, .1);
  }
  
}