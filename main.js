import './style.css';
import './input.css'
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import FirstPersonCamera from './FirstPersonCamera';
import Sun from './Planets/Sun';
import Mercury from './Planets/Mercury';
import Venus from './Planets/Venus';
import Earth from './Planets/Earth';
import Mars from './Planets/Mars';
import Jupiter from './Planets/Jupiter';
import Saturn from './Planets/Saturn';
import Uranus from './Planets/Uranus';
import Neptune from './Planets/Neptune';
import Pluto from './Planets/Pluto';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/css2drenderer';
//import tweenjs
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Main {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this.charModel = null;
        this.controls = null;
        this.orbitControls = null;
        this.cssRenderer = null;
        this.inputController = null;
        this.fpsCamera = null;
        this.objects_ = [];
        this.init();



      
    }

    
    init() {
        //create a scene
        this.scene = new THREE.Scene();
        //create a camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000000000000000);
        this.camera.lookAt(0, 0, 0);
        //this.camera.position.set(194973804.5662673+100000,71929388.07358344, 69143937.12032303 )
        //this.camera.lookAt(0, 0, 0);
        console.log(this.camera.position);

        const directionalLight = new THREE.PointLight(0xffffff, 1);
        directionalLight.position.set(0, 0, 0);
        directionalLight.distance = 100000000000000000;
        directionalLight.angle = Math.PI/4;
        directionalLight.penumbra = .5;
        //directionalLight.decay = 200;
        directionalLight.intensity = 0.9;
        //make the light look outwards
        directionalLight.lookAt(0, 0, 0);
        //add the directional light to the scene
        this.scene.add(directionalLight);



        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        //this.scene.add(ambientLight);

        // Load the image
        const image = new Image();
        image.src = 'images/skybox/starmap_16k.jpg';

        // Create the sphere
        const geometry = new THREE.SphereGeometry(500000000000000, 60, 40);
        geometry.scale(-1, 1, 1);

        // Create the material and map the image onto the surface of the sphere
        const material = new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load(image.src)
        });

        // Create the mesh and add it to the scene
        const skyMesh = new THREE.Mesh(geometry, material);
        //this.scene.add(skyMesh);
        this.objects_ = [];

        //create a renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true});
        //set the renderer's size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        //add the renderer's dom element to the body
        document.body.appendChild(this.renderer.domElement);

        //this.controls = new OrbitControls(this.camera, this.renderer.domElement);


        this.fpsCamera = new FirstPersonCamera(this.camera, this.objects_);


        //create a cannon world
        this.world = new CANNON.World();
        //set the gravity of the world
        this.world.gravity.set(0, -9.82, 0);
        //set the broadphase of the world
        this.world.broadphase = new CANNON.NaiveBroadphase();
        //set the solver of the world
        this.world.solver.iterations = 10;

        const sun = new Sun();
        this.scene.add(sun.sunMesh);
        this.updateSun = sun.updateSun.bind(sun);   
        this.sunMesh = sun.sunMesh;

        const mercury = new Mercury();
        this.scene.add(mercury.mercuryMesh);
        this.updateMercury = mercury.updateMercury.bind(mercury);
        //bind mercuryMesh
        this.mercuryMesh = mercury.mercuryMesh;
        //console.log(this.mercuryMesh.position)
       
        const venus = new Venus();
        this.scene.add(venus.venusMesh);
        this.updateVenus = venus.updateVenus.bind(venus);
        this.venusMesh = venus.venusMesh;
        //create label for Venus
       
        const earth = new Earth();
        this.scene.add(earth.earthMesh);
        this.updateEarth = earth.updateEarth.bind(earth);
        this.earthMesh = earth.earthMesh;

        const mars = new Mars();
        this.scene.add(mars.marsMesh);
        this.updateMars = mars.updateMars.bind(mars);
        this.marsMesh = mars.marsMesh;

        const jupiter = new Jupiter();
        this.scene.add(jupiter.jupiterMesh);
        this.updateJupiter = jupiter.updateJupiter.bind(jupiter);
        this.jupiterMesh = jupiter.jupiterMesh;

        const saturn = new Saturn();
        this.scene.add(saturn.saturnMesh);
        this.updateSaturn = saturn.updateSaturn.bind(saturn);
        this.saturnMesh = saturn.saturnMesh;

        const uranus = new Uranus();
        this.scene.add(uranus.uranusMesh);
        this.updateUranus = uranus.updateUranus.bind(uranus);
        this.uranusMesh = uranus.uranusMesh;

        const neptune = new Neptune();
        this.scene.add(neptune.neptuneMesh);
        this.updateNeptune = neptune.updateNeptune.bind(neptune);
        this.neptuneMesh = neptune.neptuneMesh;

        const pluto = new Pluto();
        this.scene.add(pluto.plutoMesh);
        this.updatePluto = pluto.updatePluto.bind(pluto);
        this.plutoMesh = pluto.plutoMesh;




        const planetMesh = {
            sun: {
                name: 'Sun',
                position: this.sunMesh.position
            },
            
            mercury: {
                name: 'Mercury',
                position: this.mercuryMesh.position
            },
            venus: {
                name: 'Venus',
                position: this.venusMesh.position
            },
            earth: {
                name: 'Earth',
                position: this.earthMesh.position
            },
            mars: {
                name: 'Mars',
                position: this.marsMesh.position
            },
            jupiter: {
                name: 'Jupiter',
                position: this.jupiterMesh.position
            },
            saturn: {
                name: 'Saturn',
                position: this.saturnMesh.position
            },
            uranus: {
                name: 'Uranus',
                position: this.uranusMesh.position
            },
            neptune: {
                name: 'Neptune',
                position: this.neptuneMesh.position
            },
            pluto: {
                name: 'Pluto',
                position: this.plutoMesh.position
            }
        }
        const planets = Object.values(planetMesh);

        function updatePlanetMenu(planet) {
            const planetDiv = document.getElementById(`planet-${planet.name}`);
            planetDiv.innerHTML = `
              ${planet.name} - 
              x: ${Math.floor(planet.position.x)}, 
              y: ${Math.floor(planet.position.y)}, 
              z: ${Math.floor(planet.position.z)}
              <button class="warp-button" id="warp-${planet.name}">Warp to ${planet.name}</button>
            `;
          
            // Add event listener to warp button
            const warpButton = document.getElementById(`warp-${planet.name}`);
            warpButton.addEventListener('click', () => {
              // Create TWEEN animation to warp camera to planet
              const position = planetMesh.position;
              const tween = new TWEEN.Tween(this.camera.position)
                .to({ x: position.x, y: position.y, z: position.z }, 2000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
            });
          }
        
        const planetMenu = document.getElementById("planet-menu");
        planets.forEach(planet => {
            const planetDiv = document.createElement("div");
            planetDiv.id = `planet-${planet.name}`;
            planetDiv.innerHTML = `${planet.name} - x: ${Math.floor(planet.position.x)}, y: ${Math.floor(planet.position.y)}, z: ${Math.floor(planet.position.z)}`;
            planetMenu.appendChild(planetDiv);
        });

            planets.forEach(planet => updatePlanetMenu(planet));
            //bind to this
            this.updatePlanetMenu = updatePlanetMenu.bind(updatePlanetMenu);

        let planetLabels = [];

        // create labels and add them to the scene
        planets.forEach(planet => {
            // create a CSS2DObject with the planet's name
            if(!planetLabels[planet.name]){
                const planetLabel = new CSS2DObject(document.createElement('div'));
                planetLabel.element.innerHTML = planet.name;
                planetLabel.element.style.color = "green";
                planetLabel.element.style.font = "20px Arial";
                planetLabel.position.set(planet.position.x, planet.position.y, planet.position.z);
                this.scene.add(planetLabel);
                planetLabels[planet.name] = planetLabel;
                planetLabel.lookAt(this.camera.position);
            }
        });

        function updatePlanetLabelPositions() {
            for (let i = 0; i < planets.length; i++) {
                planetLabels[planets[i].name].position.set(planets[i].position.x, planets[i].position.y, planets[i].position.z);
            }
        }

        // setInterval(() => {
        //     planets.forEach(planet => {
        //         planetLabels[planet.name].position.set(planet.position.x, planet.position.y, planet.position.z);
        //     });
        // }, 1000); // update every 1 second
        // //bind to this
        this.updatePlanetLabelPositions = updatePlanetLabelPositions.bind(updatePlanetLabelPositions);

            
            

                    

        //call updatePlanetMenu function on each planet mesh with a loop. give each planet a line in the menu
        

        
        //bind updatePlanetMenu function to this
        this.updatePlanetMenu = updatePlanetMenu.bind(updatePlanetMenu);

        const cssRenderer = new CSS2DRenderer();
        cssRenderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( cssRenderer.domElement );

       
        //bind to this
        this.cssRenderer = cssRenderer;

        
        //bind to this
        //this.updatePlanetLabel = updatePlanetLabel.bind(updatePlanetLabel);

          

        
        this.objects_ = [earth, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, sun];



        window.addEventListener('resize',
            () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        );

        this.animate();


    }


    

    animate(  ) {

      const currentTime = Date.now();
      const previousTime = currentTime;
      const dt = currentTime - previousTime;
      const time = currentTime * 0.0000000000005;
      
        this.world.step(1/60);

        
        this.updateSun(dt);
        this.updateMercury(dt);
        //console log merucry mesh's updating posiiton
        this.updateVenus(dt);
        this.updateEarth(dt);
        this.updateMars(dt);
        this.updateJupiter(dt);
        this.updateSaturn(dt);
        this.updateUranus(dt);
        this.updateNeptune(dt);
        this.updatePluto(dt);
        if(this.camera) {
        this.fpsCamera.update(time);
        //this.controls.update(this.camera, this.scene);

        }

        
        this.updatePlanetMenu(this.mercuryMesh);
        this.updatePlanetMenu(this.venusMesh);
        this.updatePlanetMenu(this.earthMesh);
        this.updatePlanetMenu(this.marsMesh);
        this.updatePlanetMenu(this.jupiterMesh);
        this.updatePlanetMenu(this.saturnMesh);
        this.updatePlanetMenu(this.uranusMesh);
        this.updatePlanetMenu(this.neptuneMesh);
        this.updatePlanetMenu(this.plutoMesh);

        this.updatePlanetLabelPositions(this.mercuryParent);
        this.updatePlanetLabelPositions(this.venusMesh);
        this.updatePlanetLabelPositions(this.earthMesh);
        this.updatePlanetLabelPositions(this.marsParent);
        this.updatePlanetLabelPositions(this.jupiterMesh);
        this.updatePlanetLabelPositions(this.saturnMesh);
        this.updatePlanetLabelPositions(this.uranusMesh);
        this.updatePlanetLabelPositions(this.neptuneMesh);
        this.updatePlanetLabelPositions(this.plutoParent);

            
        
        


        



        
        
       

     
        this.cssRenderer.render(this.scene, this.camera);
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.animate.bind(this));
        
    }

}


function main() {

    const main = new Main();

}



main();