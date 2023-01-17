import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/css2drenderer';
import './input.css'
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



export default class GameUI {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.sun = new Sun();
    this.mercury = new Mercury();
    this.venus = new Venus();
    this.earth = new Earth();
    this.mars = new Mars();
    this.jupiter = new Jupiter();
    this.saturn = new Saturn();
    this.uranus = new Uranus();
    this.neptune = new Neptune();
    this.pluto = new Pluto();


    this.speedometer = document.createElement('div');
    this.speedometer.classList.add('bg-green-500', 'p-2', 'text-white', 'text-center', 'absolute', 'top-0', 'right-0');
    this.speedometer.innerHTML = 'Speedometer';

    this.menu = document.createElement('div');
    this.menu.classList.add('bg-green-500', 'p-2', 'text-white', 'text-center', 'absolute', 'bottom-0', 'left-0');
    this.menu.style.backgroundColor = 'rgba(0,0,0,0.5)';
    this.menu.innerHTML = this.createMenuContent();

    this.warpButton = document.createElement('button');
    this.warpButton.classList.add('bg-green-500', 'p-2', 'text-white', 'text-center', 'absolute', 'bottom-0', 'right-0');
    this.warpButton.innerHTML = 'Warp';
    this.warpButton.addEventListener('click', this.warp.bind(this));

    this.minimap = document.createElement('div');
    this.minimap.classList.add('bg-green-500', 'p-2', 'text-white', 'text-center', 'absolute', 'top-0', 'left-0');
    this.minimap.innerHTML = 'Minimap';
    
    this.speedometerObject = new CSS3DObject(this.speedometer);
    this.speedometerObject.position.set(window.innerWidth / 2, 10, 0);
    this.speedometerObject.lookAt(this.camera.position);
    this.menuObject = new CSS3DObject(this.menu);
    this.menuObject.position.set(window.innerWidth / 2, window.innerHeight - 10, 0);
    this.menuObject.lookAt(this.camera.position);
    this.warpButtonObject = new CSS3DObject(this.warpButton);
    this.warpButtonObject.position.set(window.innerWidth - 10, window.innerHeight / 2, 0);
    this.warpButtonObject.lookAt(this.camera.position);
    this.minimapObject = new CSS3DObject(this.minimap);
    this.minimapObject.position.set(10, window.innerHeight / 2, 0);
    this.minimapObject.lookAt(this.camera.position);

    this.cssRenderer = new CSS3DRenderer();
    this.cssRenderer.setSize( window.innerWidth, window.innerHeight );
    this.cssRenderer.domElement.style.position = 'absolute';
    this.cssRenderer.domElement.style.top = 0;
    document.body.appendChild( this.cssRenderer.domElement );

    this.speedometerObject = new CSS3DObject(this.speedometer);
    this.menuObject = new CSS3DObject(this.menu);
    this.warpButtonObject = new CSS3DObject(this.warpButton);
    this.minimapObject = new CSS3DObject(this.minimap);

    this.scene.add(this.speedometerObject);
    this.scene.add(this.menuObject);
    this.scene.add(this.warpButtonObject);
    this.scene.add(this.minimapObject);
  }

  createMenuContent() {
    let content
    content = '<div class="menu-container bg-green-500 text-white p-2">' + content + '</div>';
    content += `<div class="bg-transparent text-green-500 p-2">Sun: (${this.sun.position.x.toFixed(0)}, ${this.sun.position.y.toFixed(0)}, ${this.sun.position.z.toFixed(0)})</div>`;
    content += `<div class="bg-transparent text-green-500 p-2">Mercury: (${this.mercury.position.x.toFixed(0)}, ${this.mercury.position.y.toFixed(0)}, $this.{mercury.position.z.toFixed(0)})</div>`;
    content += `<div class="bg-transparent text-green-500">Venus: (${this.venus.position.x.toFixed(0)}, ${this.venus.position.y.toFixed(0)}, ${this.venus.position.z.toFixed(0)})</div>`;
    content += `<div class="bg-transparent text-green-500 p-2">Earth: (${this.earth.position.x.toFixed(0)}, ${this.earth.position.y.toFixed(0)}, ${this.earth.position.z.toFixed(0)})</div>`;
    content += `<div class="bg-transparent text-green-500 p-2">Mars: (${this.mars.position.x.toFixed(0)}, ${this.mars.position.y.toFixed(0)}, ${this.mars.position.z.toFixed(0)})</div>`;
    content += `<div class="bg-transparent text-green-500 p-2">Jupiter: (${this.jupiter.position.x.toFixed(0)}, ${this.jupiter.position.y.toFixed(0)}, ${this.jupiter.position.z.toFixed(0)})</div>`;
    content += `<div class="bg-transparent text-green-500 p-2">Saturn: (${this.saturn.position.x.toFixed(0)}, ${this.saturn.position.y.toFixed(0)}, ${this.saturn.position.z.toFixed(0)})</div>`;
    content += `<div class="bg-transparent text-green-500 p-2">Uranus: (${this.uranus.position.x.toFixed(0)}, ${this.uranus.position.y.toFixed(0)}, ${this.uranus.position.z.toFixed(0)})</div>`;
    content += `<div class="bg-transparent text-green-500 p-2">Neptune: (${this.neptune.position.x.toFixed(0)}, ${this.neptune.position.y.toFixed(0)}, ${this.neptune.position.z.toFixed(0)})</div>`;
    content += `<div class="bg-transparent text-green-500 p-2">Pluto: (${this.pluto.position.x.toFixed(0)}, ${this.pluto.position.y.toFixed(0)}, ${this.pluto.position.z.toFixed(0)})</div>`;
    return content;
    }

    updateUI() {
        // this.speedometer.innerHTML = `Speed: ${this.planets[0].speed.toFixed(2)}`;
        this.menu.innerHTML = this.createMenuContent();
         this.menuObject.position.copy(this.camera.position);
    this.menuObject.quaternion.copy(this.camera.quaternion);

    this.warpButtonObject.position.copy(this.camera.position);
    this.warpButtonObject.quaternion.copy(this.camera.quaternion);

    this.minimapObject.position.copy(this.camera.position);
    this.minimapObject.quaternion.copy(this.camera.quaternion);
        this.cssRenderer.render(this.scene, this.camera);

        }

    warp() {
        console.log('Warping');
    }

   
}


