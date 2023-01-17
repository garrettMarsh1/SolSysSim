import InputController, {KEYS} from "./InputController";
import * as THREE from "three";

export function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
  }

export default class FirstPersonCamera {
    constructor(camera, objects) {
      this.camera = camera;
      this.input_ = new InputController();
      this.rotation_ = new THREE.Quaternion();
      this.translation_ = new THREE.Vector3(194903781.48572785+10000,72063925.2433987+200000, 69273264.36554492 );
      this.phi_ = 0;
      this.phiSpeed_ = 8;
      this.theta_ = 0;
      this.thetaSpeed_ = 5;
      this.headBobActive_ = false;
      this.headBobTimer_ = 0;
      this.objects_ = objects;
      this.camera.lookAt(0, 0, 0);

    }
  
    update(timeElapsedS) {
      this.updateRotation_(timeElapsedS);
      this.updateCamera_(timeElapsedS);
      this.updateTranslation_(timeElapsedS);
      this.updateHeadBob_(timeElapsedS);
      this.input_.update(timeElapsedS);
      //console.log(this.camera.position);
    }
  
    updateCamera_(_) {
      this.camera.quaternion.copy(this.rotation_);
      this.camera.position.copy(this.translation_);
      this.camera.position.y += Math.sin(this.headBobTimer_ * 10) * 1.5;
  
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(this.rotation_);
  
      const dir = forward.clone();
  
      forward.multiplyScalar(100);
      forward.add(this.translation_);
  
      let closest = forward;
      const result = new THREE.Vector3();
      const ray = new THREE.Ray(this.translation_, dir);
      for (let i = 0; i < this.objects_.length; ++i) {
        if (ray.intersectBox(this.objects_[i], result)) {
          if (result.distanceTo(ray.origin) < closest.distanceTo(ray.origin)) {
            closest = result.clone();
          }
        }
      }
  
      this.camera.lookAt(closest);
    }
  
    updateHeadBob_(timeElapsedS) {
      if (this.headBobActive_) {
        const wavelength = Math.PI;
        const nextStep = 1 + Math.floor(((this.headBobTimer_ + 0.000001) * 0.000000000000010) / wavelength);
        const nextStepTime = nextStep * wavelength / 1000000000000000000;
        this.headBobTimer_ = Math.min(this.headBobTimer_ + timeElapsedS, nextStepTime);
  
        if (this.headBobTimer_ == nextStepTime) {
          this.headBobActive_ = false;
        }
      }
    }
  
    updateTranslation_(timeElapsedS) {
      const forwardVelocity = (this.input_.key(KEYS.w) ? 1 : 0) + (this.input_.key(KEYS.s) ? -1 : 0)
      const strafeVelocity = (this.input_.key(KEYS.a) ? 1 : 0) + (this.input_.key(KEYS.d) ? -1 : 0)
      const upVelocity = (this.input_.key(KEYS.q) ? 1 : 0)
      const downVelocity = (this.input_.key(KEYS.e) ? 1 : 0)
      const rollRightVelocity = (this.input_.key(KEYS.c) ? 1 : 0)
      const rollLeftVelocity = (this.input_.key(KEYS.z) ? 1 : 0)

  
      const qx = new THREE.Quaternion();
      qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);


      const qz = new THREE.Quaternion();
      qz.setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.phi_);
  
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(qx);
      forward.multiplyScalar(forwardVelocity * timeElapsedS * 10);
  
      const left = new THREE.Vector3(-1, 0, 0);
      left.applyQuaternion(qx);
      left.multiplyScalar(strafeVelocity * timeElapsedS * 10);

      const up = new THREE.Vector3(0, 1, 0);
      up.applyQuaternion(qx);
      up.multiplyScalar(upVelocity * timeElapsedS * 10);

      const down = new THREE.Vector3(0, -1, 0);
      down.applyQuaternion(qx);
      down.multiplyScalar(downVelocity * timeElapsedS * 10);

      const rollRight = new THREE.Vector3(0, 0, 1);
      rollRight.applyQuaternion(qz);
      rollRight.multiplyScalar(rollRightVelocity * timeElapsedS * 10);

      const rollLeft = new THREE.Vector3(0, 0, -1);
      rollLeft.applyQuaternion(qz);
      rollLeft.multiplyScalar(rollLeftVelocity * timeElapsedS * 10);

  
      this.translation_.add(forward);
      this.translation_.add(left);
      this.translation_.add(up);
      this.translation_.add(down);
      this.translation_.add(rollRight);
      this.translation_.add(rollLeft);

  
      if (forwardVelocity != 0 || strafeVelocity != 0) {
        this.headBobActive_ = true;
      }
    }
  
    updateRotation_(timeElapsedS) {
      const xh = this.input_.current_.mouseXDelta / window.innerWidth;
      const yh = this.input_.current_.mouseYDelta / window.innerHeight;
  
      this.phi_ += -xh * this.phiSpeed_;
      this.theta_ = clamp(this.theta_ + -yh * this.thetaSpeed_, -Math.PI / 3, Math.PI / 3);
  
      const qx = new THREE.Quaternion();
      qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
      const qz = new THREE.Quaternion();
      qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);
  
      const q = new THREE.Quaternion();
      q.multiply(qx);
      q.multiply(qz);
  
      this.rotation_.copy(q);
    }
  }