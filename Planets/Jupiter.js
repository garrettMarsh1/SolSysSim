import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Sun from './Sun';

const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vReflRay;
    varying vec3 vRefrRay;
    varying vec2 vUv;
    uniform vec3 lightDirection = vec3(1, 1, 1);
    varying vec3 light; // adding this varying to be passed to fragment shader

    void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        vNormal = normalMatrix * normal;
        vUv = uv;
        light = lightDirection; // assign the lightDirection to light here

        gl_Position = projectionMatrix * mvPosition;
    }
`;

const fragmentShader = `
    uniform vec3 planetColor;
    uniform vec3 atmosphereColor;
    uniform vec3 lightDirection = vec3(1, 1, 1);
    uniform sampler2D jupTexture;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 light = normalize(lightDirection);

        vec4 texel = texture2D(jupTexture, vUv);
        vec4 baseColor = vec4(planetColor, 1.0);

        // Calculate the diffuse lighting term
        float diffuse = max(dot(normal, lightDirection), 0.0);
        vec3 diffuseLight = diffuse * baseColor.rgb;

        // Calculate the atmosphere color
        vec3 atmosphere = atmosphereColor * max(dot(normal, vec3(0, 1, 0)), 0.0);

        // Blend the planet color and atmosphere color
        vec3 finalColor = mix(diffuseLight, atmosphere, 0.8);
        
        // Output the final color
        gl_FragColor = vec4(finalColor, 1.0) * texel;
    }
`;

class Jupiter {
    constructor(){
        this.name = 'Jupiter';
        this.position = new THREE.Vector3(778547200, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        
        this.mass = 1.898e27; // kg
        this.radius = 69911; // km
        this.density = 1.326; // g/cm^3
        this.gravity = 24.79; // m/s^2
        this.escapeVelocity = 59.5; // km/s
        this.rotationPeriod = 0.41354; // days
        this.lengthOfDay = 9.925; // hours
        this.distanceFromSun = 778547200; // km
        this.perihelion = 740573600; // km
        this.aphelion = 816520800; // km
        this.orbitalPeriod = 4332.59; // days
        this.orbitalVelocity = 13.07; // km/s
        this.orbitalInclination = 1.305; // degrees
        this.orbitalEccentricity = 0.0489; // unitless
        this.obliquityToOrbit = 3.13; // degrees
        this.meanTemperature = 165; // K
        this.surfacePressure = 0; // Pa
        this.numberOfMoons = 79; // unitless
        this.hasRingSystem = true; // boolean
        this.hasGlobalMagneticField = true; // boolean
        this.texture = new THREE.TextureLoader().load('images/jupiter.jpeg');
        this.semiMajorAxis = (this.aphelion + this.perihelion) / 2; // a = (r_max + r_min) / 2
        this.semiMinorAxis = Math.sqrt(this.aphelion * this.perihelion); // b = sqrt(r_max * r_min)
        this.eccentricity = this.orbitalEccentricity; // e = (r_max - r_min) / (r_max + r_min)
        this.meanAnomaly = 0; // M = 0
        this.centralBody = Sun.sun
        this.surfaceTemperature = 165; // K
        this.rotationPeriod = 0.41354; // days
        this.magneticField = {
            polar: 0.0001,
            equatorial: 0.0002
        };
        this.atmosphere = {
            layers: [
                {
                    name: "troposphere",
                    temperature: 165,
                    pressure: 0
                },
                {
                    name: "stratosphere",
                    temperature: 165,
                    pressure: 0
                },
                {
                    name: "mesosphere",
                    temperature: 165,
                    pressure: 0
                },
                {
                    name: "thermosphere",
                    temperature: 165,
                    pressure: 0
                }
            ]
        };

        

        this.jupiterParent = new THREE.Object3D();
        this.jupiterMesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, 96, 96),
            new THREE.MeshLambertMaterial({
                map: this.texture
            })
        );

        this.jupiterMesh.name = this.name;
        this.jupiterMesh.position.set(this.position.x, this.position.y, this.position.z);

        this.jupiterParent.add(this.jupiterMesh);
        
       //rotate the jupiter mesh to match the orbital inclination
        this.jupiterMesh.rotation.x = this.orbitalInclination * (-Math.PI / 180);

        this.velocity = this.solveKepler(this.meanAnomaly, this.eccentricity);
        const shape = new CANNON.Sphere(this.radius);
        this.jupiterBody = new CANNON.Body({
            mass: this.mass,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            velocity: new CANNON.Vec3(this.velocity.x, this.velocity.y, this.velocity.z),
            shape: shape
        });
        this.jupiterBody.velocity.set(this.velocity.x, this.velocity.y, this.velocity.z);
    }
    calculateForce() {
        // Get the mass of the sun
        const sunMass = Sun.mass;
        // Calculate the distance between the planet and the center of the orbit
        const distance = this.jupiterMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
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
    
        this.jupiterMesh.position.set(x, y, z);
        this.jupiterBody.position.set(x, y, z);
        this.jupiterBody.velocity.set(this.orbitalVelocity * Math.cos(E), this.orbitalVelocity * Math.sin(E), this.orbitalVelocity * Math.sin(E) * Math.sin(this.orbitalInclination));
    
        this.jupiterMesh.position.set(x, y, z);
        this.jupiterParent.position.set(x, y, z);
        //console.log(this.jupiterParent.position)
    
        return new CANNON.Vec3(x, y, z);
    }

      updateJupiter() {
        this.calculateOrbit();
        this.jupiterMesh.rotation.y += this.rotationPeriod / 8640;
        this.jupiterBody.applyForce(this.calculateForce(), this.jupiterBody.position);

        
      }
    


}

export default Jupiter;