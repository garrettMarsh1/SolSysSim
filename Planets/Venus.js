//set up the Venus class just like the mercury class but with venus data
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Sun from './Sun';



class Venus {
    constructor() {
        this.name = "Venus";
        this.position = new THREE.Vector3(108208930, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.mass = 4.867e24; // kg
        //set diameter to the size of venus in kms
        this.diameter = 12104; // km
        this.density = 5243; // kg/m^3
        this.gravity = 8.87; // m/s^2
        this.escapeVelocity = 10.36; // km/s
        this.rotationPeriod = 243; // days
        this.lengthOfDay = 5832.5; // hours
        this.distanceFromSun = 108208930; // km
        this.perihelion = 107477000; // km
        this.aphelion = 108939000; // km
        this.orbitalPeriod = 224.701; // days
        this.orbitalVelocity = 35.02; // km/s
        this.orbitalInclination = 3.39; // degrees
        this.orbitalEccentricity = 0.0067; // unitless
        this.obliquityToOrbit = 177.36; // degrees
        this.meanTemperature = 737; // K
        this.surfacePressure = 92e3; // Pa
        this.numberOfMoons = 0; // unitless
        this.hasRingSystem = false; // boolean
        this.hasGlobalMagneticField = false; // boolean
        this.texture = new THREE.TextureLoader().load('images/venus.jpeg');
        this.atmosphereTexture = new THREE.TextureLoader().load('images/venusAtmosphere.jpeg');
        this.semiMajorAxis = (this.aphelion + this.perihelion) / 2; // a = (r_max + r_min) / 2
        this.semiMinorAxis = Math.sqrt(this.aphelion * this.perihelion); // b = sqrt(r_max * r_min)
        this.eccentricity = this.orbitalEccentricity; // e = (r_max - r_min) / (r_max + r_min)
        this.meanAnomaly = 0; // M = 0
        this.centralBody = Sun.mass
        this.surfaceTemperature = 737; // K
        this.rotationPeriod = 243; // days
        this.lengthOfDay = 5832.5; // hours

        this.venusParent = new THREE.Object3D();


        this.venusMesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.diameter/2, 64, 64),
            new THREE.MeshPhongMaterial({
                map: this.atmosphereTexture
            })
        );
        this.venusMesh.name = this.name;
        this.venusMesh.position.set(this.position.x, this.position.y, this.position.z);
        this.venusParent.add(this.venusMesh);

        this.velocity = this.solveKepler(this.meanAnomaly, this.eccentricity);
        const shape = new CANNON.Sphere(this.radius);
        this.venusBody = new CANNON.Body({
            mass: this.mass,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            velocity: new CANNON.Vec3(this.velocity.x, this.velocity.y, this.velocity.z),
            shape: shape
        });
        this.venusBody.velocity.set(this.velocity.x, this.velocity.y, this.velocity.z);
    }
        
    
    calculateForce() {
      // Get the mass of the sun
      const sunMass = Sun.mass;
      // Calculate the distance between the planet and the center of the orbit
      const distance = this.venusMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
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
    //FUNCTION TO CALCULATE THE ORBIT AND PROVIDE THE DATA TO ANIMATE THE PLANETS THIS IS //WHERE ITS NOT WORKING FULLY. IT PROVIDES THE COORDINATES, BUT THE PLANET WILL NOT //FOLLOW THEM. 
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
  
      this.venusMesh.position.set(x, y, z);
      this.venusBody.position.set(x, y, z);
      this.venusBody.velocity.set(this.orbitalVelocity * Math.cos(E), this.orbitalVelocity * Math.sin(E), this.orbitalVelocity * Math.sin(E) * Math.sin(this.orbitalInclination));
  
      this.venusMesh.position.set(x, y, z);
      this.venusParent.position.set(x, y, z);
      //console.log(this.venusParent.position)
  
      return new CANNON.Vec3(x, y, z);
  }

    updateVenus() {
        this.calculateOrbit();
        this.venusBody.applyForce(this.calculateForce(), this.venusBody.position);
        this.venusMesh.rotation.y += (this.rotationPeriod / 864000) * Math.PI;
        
    }

}

export default Venus;
    