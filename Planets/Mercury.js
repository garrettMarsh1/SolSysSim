import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Sun from './Sun.js';
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';

class Mercury {
    constructor() {
    this.name = "Mercury";
    this.position = new THREE.Vector3(57909050, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.mass = 3.285 * Math.pow(10, 23);
    this.diameter = 4879;
    this.density = 5427;
    this.gravity = 3.7;
    this.escapeVelocity = 4.3;
    this.rotationPeriod = 58.65;
    this.lengthOfDay = 4222.6;
    this.distanceFromSun = 57909050;
    this.perihelion = 46001200;
    this.aphelion = 69816700;
    this.orbitalPeriod = 87.969;
    this.orbitalVelocity = 47.87;
    this.orbitalInclination = 7;
    this.orbitalEccentricity = 0.2056;
    this.obliquityToOrbit = 0.034;
    this.meanTemperature = 167;
    this.surfacePressure = 0;
    this.numberOfMoons = 0;
    this.hasRingSystem = false;
    this.hasGlobalMagneticField = false;
    this.texture = new THREE.TextureLoader().load('images/mercury.jpeg');
    this.semiMajorAxis = (this.aphelion + this.perihelion) / 2; // a = (r_max + r_min) / 2
    this.eccentricity = (this.aphelion - this.perihelion) / (this.aphelion + this.perihelion); // e = (r_max - r_min) / (r_max + r_min)
    this.meanAnomaly = 0; // M = 0 at t = 0
    this.centralBody = Sun.mass
    //create a parent object for mercury called mercuryParent
    this.mercuryParent = new THREE.Object3D();
    this.mercuryMesh = new THREE.Mesh(
        new THREE.SphereGeometry(this.diameter/2, 64, 64),
        new THREE.MeshPhongMaterial({
            map: this.texture
        })
    );
    this.mercuryMesh.name = this.name;
    this.mercuryMesh.position.set(this.position.x, this.position.y, this.position.z);
    this.mercuryParent.add(this.mercuryMesh);

    //create a css renderer
    this.mercuryLabelRenderer = new CSS2DRenderer();
    this.mercuryLabelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.mercuryLabelRenderer.domElement.style.position = 'absolute';
    this.mercuryLabelRenderer.domElement.style.top = 0;
    this.mercuryLabelRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(this.mercuryLabelRenderer.domElement);


    //create a label object for mercury called mercuryLabel
    this.mercuryLabel = new CSS2DObject(document.createElement('div'));
    this.mercuryLabel.name = this.name;
    this.mercuryLabel.position.set(this.position.x, this.position.y, this.position.z);
    this.mercuryLabel.element.innerHTML = this.name;
    this.mercuryLabel.element.className = 'mercury-label';
    this.mercuryLabel.element.style.marginTop = '-1em';
    this.mercuryParent.add(this.mercuryLabel);

    


    
    // Calculate the velocity using the mean anomaly
    const velocity = this.solveKepler(this.meanAnomaly, this.eccentricity);
  
    // Create a Cannon.js body for the planet
    const shape = new CANNON.Sphere(this.diameter);
    this.mercuryBody = new CANNON.Body({
      name: this.name,
      mass: this.mass,
      position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
      velocity: new CANNON.Vec3(velocity.x, velocity.y, velocity.z),
      shape: shape
    });
    //this.mercuryBody.name = this.bodyName;
    this.mercuryBody.velocity.set(this.velocity.x, this.velocity.y, this.velocity.z);

    }

    calculateForce() {
      // Get the mass of the sun
      const sunMass = Sun.mass;
      // Calculate the distance between the planet and the center of the orbit
      const distance = this.mercuryMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
      // Calculate the force acting on the planet
      const force = 6.674e-11 * sunMass * this.mass / (distance * distance);
      // Return the force as a Cannon.js Vec3
      return new CANNON.Vec3(force, 0, 0);
  }

    solveKepler(M, e) {
        // Solve Kepler's equation for the eccentric anomaly (E) given the mean anomaly (M) and eccentricity (e)
        let E = M;
        let delta = 1;
        while (delta > 1e-6) {
          delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
          E -= delta;
        }
        //console.log(E)
        return E;
      }
      calculateOrbit() {
        let currentTime = 0
        // Calculate the elapsed time since the previous update
        const elapsedTime = (Date.now()/15000) - currentTime;
        currentTime = Date.now(); // Update current time to the current time
    
        // Calculate the new mean anomaly based on the elapsed time
        const M = this.meanAnomaly + this.orbitalVelocity * elapsedTime / 86400;
    
        const a = (this.aphelion + this.perihelion) / 2;
        const e = (this.aphelion - this.perihelion) / (this.aphelion + this.perihelion);
        const E = this.solveKepler(M, e);
        const x = a * (Math.cos(E) - e);
        const y = a * Math.sqrt(1 - e**2) * Math.sin(E);
        const z = a * Math.sqrt(1 - e**2) * Math.sin(E) * Math.sin(this.orbitalInclination);
    
        this.mercuryMesh.position.set(x, y, z);
        this.mercuryBody.position.set(x, y, z);
        this.mercuryBody.velocity.set(this.orbitalVelocity * Math.cos(E), this.orbitalVelocity * Math.sin(E), this.orbitalVelocity * Math.sin(E) * Math.sin(this.orbitalInclination));
    
        this.mercuryMesh.position.set(x, y, z);
        this.mercuryParent.position.set(x, y, z);
        //console.log(this.mercuryParent.position)
    
        return new CANNON.Vec3(x, y, z);
    }

      //calculate distance from Sun.sun to mercuryMesh
        calculateDistance() {
            const distance = this.mercuryMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
            console.log(distance)
            
        }





    updateMercury(dt) {
        //call calculate orbit on mercury
        this.calculateOrbit(dt);
        //console.log(this.mercuryMesh.position)
        //this.calculateDistance();
        this.mercuryBody.applyForce(this.calculateForce(), this.mercuryBody.position);
        this.mercuryMesh.position.copy(this.mercuryBody.position);

        this.mercuryMesh.rotation.y += this.rotationPeriod / 86400;
    }
}

export default Mercury;

