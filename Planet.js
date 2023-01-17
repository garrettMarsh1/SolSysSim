
import './style.css';
import './input.css'
import * as THREE from 'three';
import * as CANNON from 'cannon-es'

class Planet {
  constructor(options) {
    // Set up basic properties of the planet
    this.name = options.name;
    this.mass = options.mass;
    this.diameter = options.diameter;
    this.position = options.position;
    this.velocity = options.velocity;

    // Set up additional properties of the planet
    this.diameter = options.diameter;
    this.density = options.density;
    this.gravity = options.gravity;
    this.escapeVelocity = options.escapeVelocity;
    this.rotationPeriod = options.rotationPeriod;
    this.lengthOfDay = options.lengthOfDay;
    this.distanceFromSun = options.distanceFromSun;
    this.perihelion = options.perihelion;
    this.aphelion = options.aphelion;
    this.orbitalPeriod = options.orbitalPeriod;
    this.orbitalVelocity = options.orbitalVelocity;
    this.orbitalInclination = options.orbitalInclination;
    this.orbitalEccentricity = options.orbitalEccentricity;
    this.obliquityToOrbit = options.obliquityToOrbit;
    this.meanTemperature = options.meanTemperature;
    this.surfacePressure = options.surfacePressure;
    this.numberOfMoons = options.numberOfMoons;
    this.hasRingSystem = options.hasRingSystem;
    this.hasGlobalMagneticField = options.hasGlobalMagneticField;
    this.texture = options.texture;
    this.body = this.createBody();
    this.mesh = this.createMesh();
    this.semiMajorAxis = (this.aphelion + this.perihelion) / 2; // a = (r_max + r_min) / 2
    this.eccentricity = (this.aphelion - this.perihelion) / (this.aphelion + this.perihelion); // e = (r_max - r_min) / (r_max + r_min)
    this.meanAnomaly = 0; // M = 0 at t = 0
    this.centralBody = options.centralBody;
  }

 

  calculateForce() {
    this.centralBody = sun;
    // Calculate the distance between the planet and the central body
    const distance = this.mesh.position.distanceTo(this.centralBody.mesh.position);
  
    // Calculate the force acting on the planet
    const force = 6.674e-11 * this.centralBody.mass * this.mass / (distance * distance);
  
    // Return the force as a Cannon.js Vec3
    return new CANNON.Vec3(force, 0, 0);
  }

  


  createBody(meanAnomaly) {
    // Calculate the velocity using the mean anomaly
    const velocity = this.solveKepler(meanAnomaly, this.eccentricity);
  
    // Create a Cannon.js body for the planet
    const shape = new CANNON.Sphere(this.diameter);
    const body = new CANNON.Body({
      mass: this.mass,
      position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
      velocity: new CANNON.Vec3(velocity.x, velocity.y, velocity.z),
      shape: shape,
    });
    
    return body;
  }


  createMesh() {
    // Create a Three.js mesh for the planet using an image texture
    const geometry = new THREE.SphereGeometry(this.diameter, 64, 64);
    const texture = new THREE.TextureLoader().load(`images/${this.name}.jpeg`);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    //const parent = new THREE.Object3D()
    //parent.add(mesh)
    //console.log(parent.position)
    

    // Set the position of the mesh
    mesh.position.set(this.position.x, this.position.y, this.position.z) // Set the position of the mesh
    mesh.rotation.z = this.obliquityToOrbit * Math.PI / 180; // Set the rotation of the mesh
    //set the mesh postion to copy the body position
    if(this.body){
    mesh.position.set(this.body.position.x, this.body.position.y, this.body.position.z)
    }
    //set the parent position to the planet positions
    return mesh
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
    const elapsedTime = (Date.now()/10000) - currentTime;
    currentTime = Date.now(); // Update current time to the current time

    // Calculate the new mean anomaly based on the elapsed time
    const M = this.meanAnomaly + this.orbitalVelocity * elapsedTime / 86400;

    // The rest of the function can stay the same as before
    const a = (this.aphelion + this.perihelion) / 2;
    const e = (this.aphelion - this.perihelion) / (this.aphelion + this.perihelion);
    const E = this.solveKepler(M, e);
    const x = a * (Math.cos(E) - e);
    const y = a * Math.sqrt(1 - e**2) * Math.sin(E);
    this.mesh.position.set(x, y, 0);
    this.body.position.set(x, y, 0);
    this.body.velocity.set(this.orbitalVelocity * Math.cos(E), this.orbitalVelocity * Math.sin(E), 0);
    this.mesh.rotation.z += this.rotationPeriod * elapsedTime / 86400;
    
    return new CANNON.Vec3(x, y, 0);
    
  }
  
}








const sun = new Planet({
  name: 'Sun',
  position: new CANNON.Vec3(0, 0, 0),
  velocity: new CANNON.Vec3(0, 0, 0),
  mass: 1.989 * Math.pow(10, 30),
  diameter: 1392000,
  density: 1410,
  gravity: 274,
  escapeVelocity: 617.6,
  rotationPeriod: 25.05,
  lengthOfDay: 25.05,
  distanceFromSun: 0,
  perihelion: 0,
  aphelion: 0,
  orbitalPeriod: 0,
  orbitalVelocity: 0,
  orbitalInclination: 0,
  orbitalEccentricity: 0,
  obliquityToOrbit: 0,
  meanTemperature: 5505,
  surfacePressure: 0,
  numberOfMoons: 0,
  hasRingSystem: false,
  hasGlobalMagneticField: false,
  texture: 'images/sun.jpeg',
  meanAnomaly: 0,
  
  
  });


  const mercury = new Planet({
    name: 'Mercury',
    position: new CANNON.Vec3(57909050, 0, 0),
    velocity: new CANNON.Vec3(0, 0, 0),
    mass: 3.285 * Math.pow(10, 23),
    diameter: 4879,
    density: 5427,
    gravity: 3.7,
    escapeVelocity: 4.3,
    rotationPeriod: 58.65,
    lengthOfDay: 4222.6,
    distanceFromSun: 57909050,
    perihelion: 46001200,
    aphelion: 69816700,
    orbitalPeriod: 87.969,
    orbitalVelocity: 47.87,
    orbitalInclination: 7,
    orbitalEccentricity: 0.2056,
    obliquityToOrbit: 0.034,
    meanTemperature: 167,
    surfacePressure: 0,
    numberOfMoons: 0,
    hasRingSystem: false,
    hasGlobalMagneticField: false,
    texture: 'images/mercury.jpeg',
    meanAnomaly: 0,
    centralBody: sun,
  });
  
  
  const venus = new Planet({
    name: 'Venus',
    position: new CANNON.Vec3(108208000, 0, 0),
    velocity: new CANNON.Vec3(0, 0, 0),
    mass: 4.867 * Math.pow(10, 24),
    diameter: 12104,
    density: 5243,
    gravity: 8.87,
    escapeVelocity: 10.36,
    rotationPeriod: -243.02,
    lengthOfDay: 2802,
    distanceFromSun: 108208000,
    perihelion: 107477000,
    aphelion: 108939000,
    orbitalPeriod: 224.701,
    orbitalVelocity: 35.02,
    orbitalInclination: 3.39,
    orbitalEccentricity: 0.0068,
    obliquityToOrbit: 177.36,
    meanTemperature: 464,
    surfacePressure: 92000,
    numberOfMoons: 0,
    hasRingSystem: false,
    hasGlobalMagneticField: false,
    texture: 'images/venus.jpeg',
    meanAnomaly: 0,
    centralBody: sun,
  });


const earth = new Planet({
  name: 'Earth',
  position: new CANNON.Vec3(149598023, 0, 0),
  velocity: new CANNON.Vec3(0, 0, 0),
  mass: 5.972 * Math.pow(10, 24),
  diameter: 12756,
  density: 5514,
  gravity: 9.807,
  escapeVelocity: 11.186,
  rotationPeriod: 0.99726968,
  lengthOfDay: 24,
  distanceFromSun: 149598023,
  perihelion: 147095000,
  aphelion: 152100000,
  orbitalPeriod: 365.256,
  orbitalVelocity: 29.78,
  orbitalInclination: 0,
  orbitalEccentricity: 0.0167,
  obliquityToOrbit: 23.45,
  meanTemperature: 15,
  surfacePressure: 101325,
  numberOfMoons: 1,
  hasRingSystem: false,
  hasGlobalMagneticField: true,
  texture: 'images/earth.jpeg',
  meanAnomaly: 0,
  centralBody: sun,
});


const mars = new Planet({
  name: 'Mars',
  position: new CANNON.Vec3(227943824, 0, 0),
  velocity: new CANNON.Vec3(0, 0, 0),
  mass: 6.39 * Math.pow(10, 23),
  diameter: 6792,
  density: 3933,
  gravity: 3.711,
  escapeVelocity: 5.03,
  rotationPeriod: 1.025957,
  lengthOfDay: 24.7,
  distanceFromSun: 227943824,
  perihelion: 206700000,
  aphelion: 249200000,
  orbitalPeriod: 686.98,
  orbitalVelocity: 24.13,
  orbitalInclination: 1.85,
  orbitalEccentricity: 0.0934,
  obliquityToOrbit: 25.19,
  meanTemperature: -65,
  surfacePressure: 0,
  numberOfMoons: 2,
  hasRingSystem: false,
  hasGlobalMagneticField: false,
  texture: 'images/mars.jpeg',
  meanAnomaly: 0,
  centralBody: sun,
});

const jupiter = new Planet({
  name: 'Jupiter',
  position: new CANNON.Vec3(778340821, 0, 0),
  velocity: new CANNON.Vec3(0, 0, 0),
  mass: 1.898 * Math.pow(10, 27),
  diameter: 142984,
  density: 1326,
  gravity: 23.12,
  escapeVelocity: 59.5,
  rotationPeriod: 0.41354,
  lengthOfDay: 9.9,
  distanceFromSun: 778340821,
  perihelion: 740573600,
  aphelion: 816520800,
  orbitalPeriod: 4332.59,
  orbitalVelocity: 13.07,
  orbitalInclination: 1.3,
  orbitalEccentricity: 0.0489,
  obliquityToOrbit: 3.13,
  meanTemperature: -110,
  surfacePressure: 0,
  numberOfMoons: 67,
  hasRingSystem: true,
  hasGlobalMagneticField: false,
  texture: 'images/jupiter.jpeg',
  meanAnomaly: 0,
  centralBody: sun,
});

const saturn = new Planet({
  name: 'Saturn',
  position: new CANNON.Vec3(1426666422, 0, 0),
  velocity: new CANNON.Vec3(0, 0, 0),
  mass: 5.683 * Math.pow(10, 26),
  diameter: 120536,
  density: 687,
  gravity: 9.05,
  escapeVelocity: 35.5,
  rotationPeriod: 0.44401,
  lengthOfDay: 10.7,
  distanceFromSun: 1426666422,
  perihelion: 1352550000,
  aphelion: 1500783000,
  orbitalPeriod: 10759.22,
  orbitalVelocity: 9.69,
  orbitalInclination: 2.49,
  orbitalEccentricity: 0.0565,
  obliquityToOrbit: 26.73,
  meanTemperature: -140,
  surfacePressure: 0,
  numberOfMoons: 62,
  hasRingSystem: true,
  hasGlobalMagneticField: false,
  texture: 'images/saturn.jpeg',
  meanAnomaly: 0,
  centralBody: sun,
});

const uranus = new Planet({
  name: 'Uranus',
  position: new CANNON.Vec3(2870658186, 0, 0),
  velocity: new CANNON.Vec3(0, 0, 0),
  mass: 8.681 * Math.pow(10, 25),
  diameter: 51118,
  density: 1271,
  gravity: 8.69,
  escapeVelocity: 21.3,
  rotationPeriod: -0.71833,
  lengthOfDay: 17.2,
  distanceFromSun: 2870658186,
  perihelion: 2743000000,
  aphelion: 2998400000,
  orbitalPeriod: 30685.4,
  orbitalVelocity: 6.81,
  orbitalInclination: 0.77,
  orbitalEccentricity: 0.046381,
  obliquityToOrbit: 97.86,
  meanTemperature: -195,
  surfacePressure: 0,
  numberOfMoons: 27,
  hasRingSystem: true,
  hasGlobalMagneticField: false,
  texture: 'images/uranus.jpeg',
  meanAnomaly: 0,
  centralBody: sun,
});

const neptune = new Planet({
  name: 'Neptune',
  position: new CANNON.Vec3(4498396441, 0, 0),
  velocity: new CANNON.Vec3(0, 0, 0),
  mass: 1.024 * Math.pow(10, 26),
  diameter: 49528,
  density: 1638,
  gravity: 11.15,
  escapeVelocity: 23.5,
  rotationPeriod: 0.67125,
  lengthOfDay: 16.1,
  distanceFromSun: 4498396441,
  perihelion: 4444540000,
  aphelion: 4552250000,
  orbitalPeriod: 60189,
  orbitalVelocity: 5.43,
  orbitalInclination: 1.77,
  orbitalEccentricity: 0.009456,
  obliquityToOrbit: 28.32,
  meanTemperature: -200,
  surfacePressure: 0,
  numberOfMoons: 14,
  hasRingSystem: true,
  hasGlobalMagneticField: false,
  texture: 'images/neptune.jpeg',
  meanAnomaly: 0,
  centralBody: sun,
});

const pluto = new Planet({
  name: 'Pluto',
  position: new CANNON.Vec3(5906380624, 0, 0),
  velocity: new CANNON.Vec3(0, 4.67, 0),
  mass: 1.309 * Math.pow(10, 22),
  diameter: 2370,
  density: 2095,
  gravity: 0.62,
  escapeVelocity: 1.3,
  rotationPeriod: -6.38723,
  lengthOfDay: 153.3,
  distanceFromSun: 5906380624,
  perihelion: 4436.82,
  aphelion: 7375.92,
  orbitalPeriod: 90560,
  orbitalVelocity: 4.74,
  orbitalInclination: 17.15,
  orbitalEccentricity: 0.24880766,
  obliquityToOrbit: 122.53,
  meanTemperature: -225,
  surfacePressure: 0,
  numberOfMoons: 5,
  hasRingSystem: false,
  hasGlobalMagneticField: false,
  texture: 'images/pluto.jpeg',
  meanAnomaly: 0,
  centralBody: sun,
});


//update the position of each planet to match the data from calculateOrbit







const planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];

export {sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto};

export { Planet, planets }; // Export the Planet class and the planets array 

  



