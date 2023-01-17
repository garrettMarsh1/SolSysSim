import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import Sun from './Sun';
import { CSS2DObject } from 'three/examples/jsm/renderers/css2drenderer';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/css2drenderer';


class Pluto {
    constructor(){
        this.name = 'Pluto';
        this.position = new THREE.Vector3(5906380624, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.radius = 1188;
        this.mass = 1.303e22;
        this.density = 2095;
        this.gravity = 0.62;
        this.escapeVelocity = 1.3;
        this.rotationPeriod = 6.3872;
        this.lengthOfDay = 153.3;
        this.distanceFromSun = 5906380624;
        this.perihelion = 4436000000 ;
        this.aphelion = 7375000000 ;
        this.orbitalPeriod = 248.54;
        this.orbitalVelocity = 4.74;
        this.orbitalInclination = 17.15;
        this.orbitalEccentricity = 0.2488;
        this.obliquityToOrbit = 122.53;
        this.meanTemperature = -229;
        this.surfacePressure = 0;
        this.numberOfMoons = 5;
        this.moons = [];
        this.hasRingSystem = false;
        this.hasGlobalMagneticField = false;
        this.texture = new THREE.TextureLoader().load('images/pluto.jpeg');
        this.semiMajorAxis = (this.aphelion + this.perihelion) / 2; // a = (r_max + r_min) / 2
        this.semiMinorAxis = Math.sqrt(this.aphelion * this.perihelion); // b = sqrt(r_max * r_min)
        this.eccentricity = this.orbitalEccentricity; // e = (r_max - r_min) / (r_max + r_min)
        this.meanAnomaly = 0; // M = 0
        this.centralBody = Sun.sun;
        this.composition = {
            'Nitrogen': 2.7,
            'Methane': 0.2,
            'Carbon Monoxide': 0.2,
            'Carbon Dioxide': 0.1,
            'Water': 0.1,
            'Ammonia': 0.1,
            'Sodium': 0.1,
            'Magnesium': 0.1,
            'Silicon': 0.1,
            'Iron': 0.1
        };
        this.plutoParent = new THREE.Object3D();
        this.plutoMesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, 96, 96),
            new THREE.MeshPhongMaterial({
                map: this.texture
            })
        );
        this.plutoMesh.name = this.name;
        this.plutoMesh.position.set(this.position.x, this.position.y, this.position.z);
        this.plutoParent.add(this.plutoMesh);





        this.velocity = this.solveKepler(this.meanAnomaly, this.eccentricity);
        const shape = new CANNON.Sphere(this.radius);
        this.plutoBody = new CANNON.Body({
            mass: this.mass,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            shape: shape
        });
        this.plutoBody.velocity.set(this.velocity.x, this.velocity.y, this.velocity.z);

        
    }
    calculateForce() {
      // Get the mass of the sun
      const sunMass = Sun.mass;
      // Calculate the distance between the planet and the center of the orbit
      const distance = this.plutoMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
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
    
        this.plutoMesh.position.set(x, y, z);
        this.plutoBody.position.set(x, y, z);
        this.plutoBody.velocity.set(this.orbitalVelocity * Math.cos(E), this.orbitalVelocity * Math.sin(E), this.orbitalVelocity * Math.sin(E) * Math.sin(this.orbitalInclination));
    
        this.plutoMesh.position.set(x, y, z);
        this.plutoParent.position.set(x, y, z);
        //console.log(this.plutoParent.position)
    
        return new CANNON.Vec3(x, y, z);
    }

      updatePluto() {
        
        this.calculateOrbit();
        this.plutoMesh.rotation.y += this.rotationPeriod / 8640;
        this.plutoBody.applyForce(this.calculateForce(), this.plutoBody.position);

        
      }
    


}

export default Pluto;
    



