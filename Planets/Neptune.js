import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import Sun from './Sun';

const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vReflRay;
    varying vec3 vRefrRay;
    varying vec2 vUv;
    uniform vec3 lightDirection;
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
    uniform vec3 lightDirection;
    uniform sampler2D nepTexture;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 light = normalize(lightDirection);

        vec4 texel = texture2D(nepTexture, vUv);
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




class Neptune {
    constructor(){
        this.name = 'Neptune';
        this.position = new THREE.Vector3(4498396441, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.radius = 24764;
        this.mass = 1.024e26;
        this.density = 1638;
        this.gravity = 11.15;
        this.escapeVelocity = 23.5;
        this.rotationPeriod = 0.67125;
        this.lengthOfDay = 16.11;
        this.distanceFromSun = 4498396441;
        this.perihelion = 4444600000;
        this.aphelion = 4552200000;
        this.orbitalPeriod = 60190;
        this.orbitalVelocity = 5.43;
        this.orbitalInclination = 1.77;
        this.orbitalEccentricity = 0.010;
        this.obliquityToOrbit = 28.32;
        this.meanTemperature = -201;
        this.numberOfMoons = 14;
        this.surfacePressure = 0;
        this.hasRingSytstem = false;
        this.hasGlobalMagneticField = true;
        this.texture = new THREE.TextureLoader().load('images/neptune.jpeg');
        this.semiMajorAxis = (this.aphelion + this.perihelion) / 2; // a = (r_max + r_min) / 2
        this.semiMinorAxis = Math.sqrt(this.aphelion * this.perihelion); // b = sqrt(r_max * r_min)
        this.eccentricity = this.orbitalEccentricity; // e = (r_max - r_min) / (r_max + r_min) 
        this.meanAnomaly = 0; // M = 0
        this.rotationPeriod = 0.67125;
        this.surfaceTemperature = -201;
        this.centralBody = Sun.sun;
        //add the compostion of neptune 
        this.composition = {
            'Hydrogen': 76.3,
            'Helium': 23.1,
            'Methane': 0.6
        };


        this.albedo = 0.5;
        this.atmosphereScale = 0.1;
        this.lightDirection = new THREE.Vector3(1, 1, 1);

        // this.neptuneParent = new THREE.Object3D();
        // this.neptuneMesh = new THREE.Mesh(
        //     new THREE.SphereGeometry(this.radius, 96, 96),
        //     new THREE.ShaderMaterial({
        //         uniforms: {
        //             nepTexture: { value: new THREE.TextureLoader().load('images/neptune.jpeg') },
        //             planetColor: { value: new THREE.Color(0x6699ff) },
        //             atmosphereColor: { value: new THREE.Color(0x6699ff) },
        //             light: { value: new THREE.Vector3(0,0,0) }, // adding the light vector to uniform
        //         },
        //         vertexShader: vertexShader,
        //         fragmentShader: fragmentShader,
                
        //     })
        // );

        this.neptuneParent = new THREE.Object3D();
        this.neptuneMesh = new THREE.Mesh(
        new THREE.SphereGeometry(this.radius, 64, 64),
        new THREE.MeshBasicMaterial({
            map: this.texture
        })
    );
        this.neptuneMesh.name = this.name;
        this.neptuneMesh.position.set(this.position.x, this.position.y, this.position.z);
        this.neptuneParent.add(this.neptuneMesh);


        //this.light.position.set(this.neptuneMesh.position.x+60000, this.neptuneMesh.position.y+6000, this.neptuneMesh.position.z)
        //this.light.lookAt(this.neptuneMesh.position);
        this.neptuneMesh.name = this.name;
        this.neptuneParent.add(this.neptuneMesh);

        this.velocity = this.solveKepler(this.meanAnomaly, this.eccentricity);
        const shape = new CANNON.Sphere(this.radius);
        this.neptuneBody = new CANNON.Body({
            mass: this.mass,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            shape: shape
        });

        this.neptuneBody.velocity.set(this.velocity.x, this.velocity.y, this.velocity.z);

}

calculateForce() {
    // Get the mass of the sun
    const sunMass = Sun.mass;
    // Calculate the distance between the planet and the center of the orbit
    const distance = this.neptuneMesh.position.distanceTo(new THREE.Vector3(0, 0, 0));
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

    this.neptuneMesh.position.set(x, y, z);
    this.neptuneBody.position.set(x, y, z);
    this.neptuneBody.velocity.set(this.orbitalVelocity * Math.cos(E), this.orbitalVelocity * Math.sin(E), this.orbitalVelocity * Math.sin(E) * Math.sin(this.orbitalInclination));

    this.neptuneMesh.position.set(x, y, z);
    this.neptuneParent.position.set(x, y, z);
    //console.log(this.neptuneParent.position)

    return new CANNON.Vec3(x, y, z);
}

  updateNeptune() {
    this.calculateOrbit();
    this.neptuneMesh.rotation.y += this.rotationPeriod / 86400;
    this.neptuneBody.applyForce(this.calculateForce(), this.neptuneBody.position);
    
  }



}

export default Neptune;


    