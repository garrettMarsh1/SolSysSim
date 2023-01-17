import './style.css';
import './input.css'
import * as THREE from 'three';
import * as CANNON from 'cannon-es'
//import gltf loader from three
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//import Controls from './Controls';



//create a character model class that loads in the retroUFO.glb file and creates a mesh and adds it to the scene. 

export default class CharModel {
    constructor(scene, world, position, rotation, scale) {
        this.scene = scene;
        this.world = world;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.mesh = null;
        this.body = null;
        this.init();
        this.cameraParent = null;

        this.frontPoint = new THREE.Vector3(0, 0, 0);
        //set the position of the front point vector to the desired point on the model
        
        
    }

    
    update() {
        //make sure the model hovers and never falls
        
            
        
    }

    init() {
        //create a gltf loader
        const loader = new GLTFLoader();
        //load the retroUFO.glb file
        loader.load('assets/retroUFO.glb', (gltf) => {
            //create a mesh from the gltf file
            this.mesh = gltf.scene.children[0];
            //set the mesh's position, rotation, and scale
            this.mesh.position.copy(this.position);
            this.mesh.rotation.copy(this.rotation);
            //scale down the model to 0.1
            this.mesh.scale.set(0.02, .02, .02);
            this.frontPoint.set(this.mesh.position.x+.1, this.mesh.position.yaa, this.mesh.position.z);
            //this.mesh.scale.copy(this.scale);
            //add the mesh to the scene
            this.scene.add(this.mesh);
            //create a cannon body for the mesh
            this.body = new CANNON.Body({
                mass: 0,
                shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
                position: new CANNON.Vec3(0, 0, 0),
                material: new CANNON.Material('playerMaterial')
            });

            
            //add the body to the world
            this.world.addBody(this.body);
        });
    }
}