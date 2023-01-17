import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import Sun from './Sun';

const vertexShader = `
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
        vNormal = normal;
        vUv = uv;

        // Compute the model-view-projection matrix and pass it to the fragment shader
        mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix;
        gl_Position = mvpMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform vec3 planetColor;
    uniform vec3 atmosphereColor;
    uniform vec3 lightDirection;
    varying vec3 vNormal;
    varying vec2 vUv;


    void main() {
        vec3 normal = normalize(vNormal);
        vec3 light = normalize(lightDirection);

        // Calculate the diffuse lighting term
        float diffuse = max(dot(normal, light), 0.0);
        vec3 diffuseLight = diffuse * planetColor;

        // Calculate the atmosphere color
        vec3 atmosphere = atmosphereColor * max(dot(normal, vec3(0, 1, 0)), 0.0);

        // Blend the planet color and atmosphere color
        vec3 finalColor = mix(diffuseLight, atmosphere, 0.8);
        
        // Output the final color
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;


class Uranus { 
    constructor(){
        this.light = new THREE.DirectionalLight(0xffffff, 10000);
        this.name = 'Uranus';
        this.position = new THREE.Vector3(2870658186, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.radius = 25559;
        this.mass = 8.681e25;
        this.density = 1271;
        this.gravity = 8.87;
        this.escapeVelocity = 21.3;
        this.rotationPeriod = 17.24 ;
        this.lengthOfDay = 17.24;
        this.distanceFromSun = 2870658186;
        this.perihelion = 2743000000;
        this.aphelion = 2998400000;
        this.orbitalPeriod = 30589.75;
        this.orbitalVelocity = 6.81;
        this.orbitalInclination = 0.772;
        this.orbitalEccentricity = 0.046381;
        this.obliquityToOrbit = 97.77;
        this.meanTemperature = -195;
        this.surfacePressure = 0;
        this.numberOfMoons = 27;
        this.hasRingSystem = true;
        this.hasGlobalMagneticField = true;
        //this.texture = new THREE.TextureLoader().load('images/uranus.jpeg');
        this.semiMajorAxis = (this.aphelion + this.perihelion) / 2; // a = (r_max + r_min) / 2
        this.semiMinorAxis = Math.sqrt(this.aphelion * this.perihelion); // b = sqrt(r_max * r_min)
        this.eccentricity = this.orbitalEccentricity; // e = (r_max - r_min) / (r_max + r_min)
        this.meanAnomaly = 0; // M = 0
        this.centralBody = Sun.mass
        this.surfaceTemperature = 77; // K
        this.rotationPeriod = 0.71833; // days
        this.magneticField = {
            polar: 0.0001,
            equatorial: 0.0002
        };
        this.composition = {
            hydrogen: 0.76,
            helium: 0.24,
            methane: 0.01,
            water: 0.01,
            ammonia: 0.01,
            other: 0.01
        };

        this.atmosphere = {
            layers: [
                {
                    name: "troposphere",
                    temperature: 77,
                    pressure: 0
                },
                {
                    name: "stratosphere",
                    temperature: 77,
                    pressure: 0
                },
                {
                    name: "mesosphere",
                    temperature: 77,
                    pressure: 0
                },
                {
                    name: "thermosphere",
                    temperature: 77,
                    pressure: 0
                }
            ]
    }

        this.albedo = 0.5;
        this.atmosphereScale = 0.1;
        this.lightDirection = new THREE.Vector3(1, 1, 1);

    //     this.uranusMesh = new THREE.Mesh(
    //         new THREE.SphereGeometry(this.radius, 96, 96),
    //         new THREE.ShaderMaterial({
    //     uniforms: {
    //         planetColor: { value: new THREE.Color(0x6699ff) },
    //         atmosphereColor: { value: new THREE.Color(0x6699ff) },
    //         lightDirection: { value: new THREE.Vector3(0, 0, 0) },
            
            
    //     },
    //     vertexShader: vertexShader,
    //     fragmentShader: fragmentShader,
    //     })
    // );
        
        this.uranusParent = new THREE.Object3D();
        this.uranusMesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, 96, 96),
            new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load('images/uranus.jpeg'),
                
            })
        );

        this.uranusMesh.name = this.name;
        this.uranusParent.add(this.uranusMesh);
        this.uranusMesh.position.set(this.position.x, this.position.y, this.position.z);
        this.velocity = this.solveKepler(this.meanAnomaly, this.eccentricity);
        const shape = new CANNON.Sphere(this.radius);
        this.uranusBody = new CANNON.Body({
            mass: this.mass,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            velocity: new CANNON.Vec3(this.velocity.x, this.velocity.y, this.velocity.z),
            shape: shape
        });
        this.uranusBody.velocity.set(this.velocity.x, this.velocity.y, this.velocity.z);
    }


    calculateForce() {
        // Get the mass of the sun
        const sunMass = Sun.mass;
        // Calculate the distance between the planet and the center of the orbit
        const distance = this.uranusMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
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
    
        this.uranusMesh.position.set(x, y, z);
        this.uranusBody.position.set(x, y, z);
        this.uranusBody.velocity.set(this.orbitalVelocity * Math.cos(E), this.orbitalVelocity * Math.sin(E), this.orbitalVelocity * Math.sin(E) * Math.sin(this.orbitalInclination));
    
        this.uranusMesh.position.set(x, y, z);
        this.uranusParent.position.set(x, y, z);
        //console.log(this.uranusParent.position)
    
        return new CANNON.Vec3(x, y, z);
    }
    
    updateUranus() {
        this.calculateOrbit();
        this.uranusBody.applyForce(this.calculateForce(), this.uranusBody.position);

    
        // Rotate the planet around its own axis
        this.uranusMesh.rotation.x += this.rotationPeriod/150000;
    }
    


}

export default Uranus;
