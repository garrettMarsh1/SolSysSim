import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Sun from './Sun.js';

const vertexShader = `
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;
uniform mat4 rotationMatrix;
void main() {
    vNormal = normal;
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vWorldPosition = (rotationMatrix * vec4(vWorldPosition, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D earthMap;
uniform vec3 lightPos;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;
void main() {
    vec4 earthColor = texture2D(earthMap, vUv);
    vec3 lightDirection = normalize(lightPos - vWorldPosition);
    float light = dot(vNormal, lightDirection);
    gl_FragColor = vec4(earthColor.rgb * light, earthColor.a);
}
`;

const cloudVertexShader = ``;

const cloudFragmentShader = ``;


class Earth {
    constructor() {
        this.name = "Earth";
        this.position = new THREE.Vector3(149597890, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.mass = 5.972e24; // kg
        this.diameter = 12742; // km
        this.density = 5514; // kg/m^3
        this.gravity = 9.807; // m/s^2
        this.escapeVelocity = 11.186; // km/s
        this.rotationPeriod = 1; // days
        this.lengthOfDay = 24; // hours
        this.distanceFromSun = 149597890; // km
        this.perihelion = 147095000; // km
        this.aphelion = 152100000; // km
        this.orbitalPeriod = 365.256; // days
        this.orbitalVelocity = 29.78; // km/s
        this.orbitalInclination = 0.0; // degrees
        this.orbitalEccentricity = 0.0167; // unitless
        this.obliquityToOrbit = 23.439; // degrees
        this.meanTemperature = 288; // K
        this.surfacePressure = 101325; // Pa
        this.numberOfMoons = 1; // unitless
        this.hasRingSystem = false; // boolean
        this.hasGlobalMagneticField = true; // boolean
        this.texture = new THREE.TextureLoader().load('images/earth.jpeg');
        this.cloudTexture = new THREE.TextureLoader().load('images/earthClouds.jpeg');
        this.semiMajorAxis = (this.aphelion + this.perihelion) / 2; // a = (r_max + r_min) / 2
        this.semiMinorAxis = Math.sqrt(this.aphelion * this.perihelion); // b = sqrt(r_max * r_min)
        this.eccentricity = this.orbitalEccentricity; // e = (r_max - r_min) / (r_max + r_min)
        this.meanAnomaly = 0; // M = 0
        this.centralBody = Sun.mass
        this.surfaceTemperature = 288; // K
        this.rotationPeriod = 1; // days
        this.magneticField = {
            polar: 2e-5,
            equatorial: 4e-5
        };
        this.atmosphere = {
            layers: [
                {
                    name: "troposphere",
                    temperature: 288,
                    pressure: 101325
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
        this.earthParent = new THREE.Object3D();
        
        this.earthMesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.diameter / 2, 64, 64),
            new THREE.MeshPhongMaterial({
                map: this.texture
            })
        );
        this.earthMesh.position.set(this.position.x, this.position.y, this.position.z);

        
        

        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationX(80 * Math.PI / 180); // rotate 80 degrees around the x-axis
        
        this.cloudMesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.diameter / 2 + 2.1, 64, 64),
            new THREE.MeshBasicMaterial({
                map: this.cloudTexture,
                transparent: true,
                opacity: 0.39,
                backside: true,
                
            })
        );
        this.cloudMesh.rotation.x = 80 * Math.PI / 90;
        this.cloudMesh.matrixAutoUpdate = false;
        this.cloudMesh.updateMatrix();
        this.cloudMesh.position.set(this.position.x, this.position.y, this.position.z);
        this.cloudMesh.name = this.name;
        this.earthParent.add(this.cloudMesh);
        

        this.earthMesh.name = this.name;
        this.earthParent.add(this.earthMesh);
        this.earthParent.lookAt(new THREE.Vector3(10, 0, 0));

       
        //this.earthCloudMesh.position.set(this.earthMesh.position.x, this.earthMesh.position.y, this.earthMesh.position.z);
        this.earthMesh.rotateX(Math.PI /2);


        this.velocity = this.solveKepler(this.meanAnomaly, this.eccentricity);
        const shape = new CANNON.Sphere(this.diameter / 2);
        this.earthBody = new CANNON.Body({
            mass: this.mass,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            velocity: new CANNON.Vec3(this.velocity.x, this.velocity.y, this.velocity.z),
            shape: shape
        });
        this.earthBody.velocity.set(this.velocity.x, this.velocity.y, this.velocity.z);
    }

    calculateForce() {
        // Get the mass of the sun
        const sunMass = Sun.mass;
        // Calculate the distance between the planet and the center of the orbit
        const distance = this.earthMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
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
    
        this.earthBody.position.set(x, y, z);
        this.earthBody.velocity.set(this.orbitalVelocity * Math.cos(E), this.orbitalVelocity * Math.sin(E), this.orbitalVelocity * Math.sin(E) * Math.sin(this.orbitalInclination));
    
        this.earthMesh.position.set(x, y, z);
        this.earthParent.position.set(x, y, z);
        //console.log(this.earthParent.position)
        this.cloudMesh.position.set(x, y, z);
    
        return new CANNON.Vec3(x, y, z);
    }

    //calculate distance from Sun.sun to mercuryMesh
    calculateDistance() {
        const distance = this.earthMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
        console.log(distance)
        
    }

      updateEarth() {
        this.calculateOrbit();
        this.earthMesh.rotation.y += this.rotationPeriod/3400;
        //this.earthMesh.rotation.z += this.rotationPeriod/8400;
        this.earthBody.applyForce(this.calculateForce(), this.earthBody.position);
        //this.calculateDistance();
        
      }
    


}

export default Earth;