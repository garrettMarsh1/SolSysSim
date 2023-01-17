import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


const sunTexture = new THREE.TextureLoader().load('images/sun.jpeg');

class Sun {
    constructor() {
      this.name = "Sun";
      this.mass = 1.989e30; // kg
      this.position = new THREE.Vector3(0, 0, 0);
      this.velocity = new THREE.Vector3(0, 0, 0);
      this.radius = 696342e3/1000; // m
      this.surfaceTemperature = 5778; // K
      this.luminosity = 1; // W
      this.age = 4.6e9; // years
      this.composition = {
        Hydrogen: 74.9,
        Helium: 24.1,
        Oxygen: 0.06,
        Carbon: 0.03,
        Neon: 0.01,
        Nitrogen: 0.01
      };
      this.rotationPeriod = 25.05; // days
      this.magneticField = {
        polar: 2e-5,
        equatorial: 4e-5
      };
      this.atmosphere = {
        layers: [
          {
            name: "photosphere",
            temperature: 5778,
            pressure: 0
          },
          {
            name: "chromosphere",
            temperature: 10000,
            pressure: 0
          },
          {
            name: "corona",
            temperature: 1e6,
            pressure: 0
          }
        ]
      };
      this.sunMesh = new THREE.Mesh(
        new THREE.SphereGeometry(this.radius, 64, 64),
        new THREE.MeshBasicMaterial({
            map: sunTexture
        })
    );
    this.sunMesh.name = this.name;
    this.sunMesh.position.set(0, 0, 0);

    
    
    
    

    
    


   
    
}

updateSun() {
    //rotate sun on y axis
    this.sunMesh.rotation.y += 0.0005;
    //console.log(this.sunMesh.position)
}
  }

export default Sun;