import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Sun from './Sun';

const vertexShader = `
varying vec3 normalInterp;
varying vec3 vertPos;

void main() {
    normalInterp = normal;
    vertPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

`;

const fragmentShader = `
uniform sampler2D ringTex;
uniform vec3 lightPos;

varying vec3 normalInterp;
varying vec3 vertPos;

void main() {
    vec3 lightDir = normalize(lightPos - vertPos);
    float diffuse = max(dot(normalInterp, lightDir), 0.0);
    vec4 ringColor = texture2D(ringTex, vec2(gl_FragCoord.x/960.0, gl_FragCoord.y/960.0));
    if (diffuse > 0.0) {
        gl_FragColor = vec4(ringColor.rgb, 1.0);
    } else {
        discard;
    }
}
`;

class Saturn {
    constructor(){
        this.name = 'Saturn';
        this.position = new THREE.Vector3(1433449370, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.mass = 5.683e26; // kg
        this.radius = 58232; // km
        this.density = 0.687; // g/cm^3
        this.gravity = 10.44; // m/s^2
        this.escapeVelocity = 35.5; // km/s
        this.rotationPeriod = 0.444; // days
        this.lengthOfDay = 10.66; // hours
        this.distanceFromSun = 1433449370; // km
        this.perihelion = 1352550000; // km
        this.aphelion = 1514348740; // km
        this.orbitalPeriod = 10759.22; // days
        this.orbitalVelocity = 9.69; // km/s
        this.orbitalInclination = 2.485; // degrees
        this.orbitalEccentricity = 0.0565; // unitless
        this.obliquityToOrbit = 26.73; // degrees
        this.meanTemperature = 134; // K
        this.surfacePressure = 0; // Pa
        this.numberOfMoons = 82; // unitless
        this.hasRingSystem = true; // boolean
        this.hasGlobalMagneticField = true; // boolean
        this.texture = new THREE.TextureLoader().load('images/saturn.jpeg');
        this.ringTexture = new THREE.TextureLoader().load('images/saturnRing.jpeg');
        this.semiMajorAxis = (this.aphelion + this.perihelion) / 2; // a = (r_max + r_min) / 2
        this.semiMinorAxis = Math.sqrt(this.aphelion * this.perihelion); // b = sqrt(r_max * r_min)
        this.eccentricity = this.orbitalEccentricity; // e = (r_max - r_min) / (r_max + r_min)
        this.meanAnomaly = 0; // M = 0
        this.centralBody = Sun.position
        this.surfaceTemperature = 134; // K
        this.rotationPeriod = 0.444; // days
        this.magneticField = {
            polar: 0.0001,
            equatorial: 0.0002
        };
        this.atmosphere = {
            layers: [
                {
                    name: "troposphere",
                    temperature: 134,
                    pressure: 0
                },
                {
                    name: "stratosphere",
                    temperature: 134,
                    pressure: 0
                },
                {
                    name: "mesosphere",
                    temperature: 134,
                    pressure: 0
                },
                {
                    name: "thermosphere",
                    temperature: 134,
                    pressure: 0
                }
            ]
        };
        this.saturnParent = new THREE.Object3D();
        this.saturnMesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, 96, 96),
            new THREE.MeshPhongMaterial({
                map: this.texture,
                transparent: true,
                opacity: 0.97

            })
        );
        this.saturnMesh.name = this.name;
        this.saturnMesh.position.set(this.position.x, this.position.y, this.position.z);

        this.ringMesh = new THREE.Mesh(
            new THREE.RingGeometry(this.radius + 40000, this.radius + 70000, 960, 960, 0, Math.PI * 2),
            new THREE.ShaderMaterial({
                uniforms: {
                    ringTex: {  value: this.ringTexture },
                    lightPos: {  value: new THREE.Vector3(0, 0, 0) }
                },
                vertexShader,
                fragmentShader,
                side: THREE.DoubleSide
            })
        );
        this.ringMesh.name = this.name + ' Ring';
        this.ringMesh.rotation.x = Math.PI / 2;
        this.ringMesh.position.set(this.position.x, this.position.y, this.position.z);

        this.saturnMesh.add(this.ringMesh);
        this.saturnParent.add(this.saturnMesh);
        this.saturnParent.position.set(this.position.x, this.position.y, this.position.z);

        //tilt the planet according to its obliquity to orbit
        this.saturnMesh.rotation.x = this.obliquityToOrbit * (Math.PI / 180);

        this.velocity = this.solveKepler(this.meanAnomaly, this.eccentricity);
        const shape = new CANNON.Sphere(this.radius);
        this.saturnBody = new CANNON.Body({
            mass: this.mass,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            shape: shape
        });
        this.saturnBody.velocity.set(this.velocity.x, this.velocity.y, this.velocity.z);
    }
    calculateForce() {
        // Get the mass of the sun
        const sunMass = Sun.mass;
        // Calculate the distance between the planet and the center of the orbit
        const distance = this.saturnMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
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
    
        this.saturnMesh.position.set(x, y, z);
        this.saturnBody.position.set(x, y, z);
        this.saturnBody.velocity.set(this.orbitalVelocity * Math.cos(E), this.orbitalVelocity * Math.sin(E), this.orbitalVelocity * Math.sin(E) * Math.sin(this.orbitalInclination));
    
        this.saturnMesh.position.set(x, y, z);
        this.saturnParent.position.set(x, y, z);
        
    
        return new CANNON.Vec3(x, y, z);
    }

    updateSaturn() {
        this.calculateOrbit();
        this.saturnBody.applyForce(this.calculateForce(), this.saturnBody.position);
        this.saturnMesh.rotation.y += this.rotationPeriod * (Math.PI / 180) / 18;
        //this.saturnMesh.rotation.y  

        //console.log(this.saturnMesh.position)
    }
    


}

export default Saturn;

        
    
