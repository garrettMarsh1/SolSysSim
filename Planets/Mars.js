import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Sun from './Sun.js';

class Mars {
    constructor() {
        this.name="Mars";
        this.position = new THREE.Vector3(227936640, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.mass = 6.39e23; // kg
        this.diameter = 6792; // km
        this.density = 3933; // kg/m^3
        this.gravity = 3.711; // m/s^2
        this.escapeVelocity = 5.03; // km/s
        this.rotationPeriod = 1.03; // days
        this.lengthOfDay = 24.7; // hours
        this.distanceFromSun = 227936640; // km
        this.perihelion = 206700000; // km
        this.aphelion = 249200000; // km
        this.orbitalPeriod = 686.98; // days
        this.orbitalVelocity = 24.13; // km/s
        this.orbitalInclination = 1.85; // degrees
        this.orbitalEccentricity = 0.0934; // unitless
        this.obliquityToOrbit = 25.19; // degrees
        this.meanTemperature = 210; // K
        this.surfacePressure = 0.006; // Pa
        this.numberOfMoons = 2; // unitless
        this.hasRingSystem = false; // boolean
        this.hasGlobalMagneticField = true; // boolean
        this.texture = new THREE.TextureLoader().load('images/mars.jpeg');
        this.semiMajorAxis = (this.aphelion + this.perihelion) / 2; // a = (r_max + r_min) / 2
        this.semiMinorAxis = Math.sqrt(this.aphelion * this.perihelion); // b = sqrt(r_max * r_min)
        this.eccentricity = this.orbitalEccentricity; // e = (r_max - r_min) / (r_max + r_min)
        this.meanAnomaly = 0; // M = 0
        this.centralBody = Sun.mass
        this.surfaceTemperature = 210; // K
        this.rotationPeriod = 1.03; // days
        this.magneticField = {
            polar: 2e-5,
            equatorial: 4e-5
        };
        this.atmosphere = {
            layers: [
                {
                    name: "troposphere",
                    temperature: 210,
                    pressure: 0.006
                },
                {
                    name: "stratosphere",
                    temperature: 216,
                    pressure: 22632
                },
                {
                    name: "mesosphere",
                    temperature: 186,
                    pressure: 5474
                },
                {
                    name: "thermosphere",
                    temperature: 186,
                    pressure: 5474
                }
            ]
        };

        this.marsParent = new THREE.Object3D();
        this.marsMesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.diameter / 2, 64, 64),
            new THREE.MeshPhongMaterial({
                map: this.texture
            })
        );
        this.marsMesh.name = this.name;
        this.marsMesh.position.set(this.position.x, this.position.y, this.position.z);
        this.marsParent.add(this.marsMesh);
        this.velocity = this.solveKepler(this.meanAnomaly, this.eccentricity);
        const shape = new CANNON.Sphere(this.diameter / 2);
        this.marsBody = new CANNON.Body({
            mass: this.mass,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            velocity: new CANNON.Vec3(this.velocity.x, this.velocity.y, this.velocity.z),
            shape: shape
        });
        this.marsBody.velocity.set(this.velocity.x, this.velocity.y, this.velocity.z);
    }
    calculateForce() {
        // Get the mass of the sun
        const sunMass = Sun.mass;
        // Calculate the distance between the planet and the center of the orbit
        const distance = this.marsMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
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
        const elapsedTime = (Date.now()/150000) - currentTime;
        currentTime = Date.now(); // Update current time to the current time
    
        // Calculate the new mean anomaly based on the elapsed time
        const M = this.meanAnomaly + this.orbitalVelocity * elapsedTime / 86400;
    
        const a = (this.aphelion + this.perihelion) / 2;
        const e = (this.aphelion - this.perihelion) / (this.aphelion + this.perihelion);
        const E = this.solveKepler(M, e);
        const x = a * (Math.cos(E) - e);
        const y = a * Math.sqrt(1 - e**2) * Math.sin(E);
        const z = a * Math.sqrt(1 - e**2) * Math.sin(E) * Math.sin(this.orbitalInclination);
    
        this.marsMesh.position.set(x, y, z);
        this.marsBody.position.set(x, y, z);
        this.marsBody.velocity.set(this.orbitalVelocity * Math.cos(E), this.orbitalVelocity * Math.sin(E), this.orbitalVelocity * Math.sin(E) * Math.sin(this.orbitalInclination));
    
        this.marsMesh.position.set(x, y, z);
        this.marsParent.position.set(x, y, z);
        //console.log(this.marsParent.position)
    
        return new CANNON.Vec3(x, y, z);
    }
      updateMars() {
        this.calculateOrbit();
        this.marsBody.applyForce(this.calculateForce(), this.marsBody.position);
        this.marsMesh.rotation.y += this.rotationPeriod / 8640;
        
      }
    


}

export default Mars;









