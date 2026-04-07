import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import Stats from 'three/examples/jsm/libs/stats.module';

if (WEBGL.isWebGL2Available()) {
    console.log('WebGL2 is available');

    // Escena
    const scene = new THREE.Scene();

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Cámara
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(0, 0, 300);

    // Luces (necesarias para MeshPhongMaterial)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Texturas
    const textureLoader = new THREE.TextureLoader();
    const material = new THREE.MeshPhongMaterial({
        map:       textureLoader.load('textures/brick.jpeg'),
        bumpMap:   textureLoader.load('textures/brick-map.jpeg'),
        bumpScale: 1
    });

    // Cubo
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const box = new THREE.Mesh(geometry, material);
    box.rotation.set(Math.PI / 5, Math.PI / 5, 0);
    scene.add(box);

    // Control de framerate (debe ser accesible desde animate)
    const stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0px';
    document.body.appendChild(stats.dom);

    // Objeto contenedor de las variables de control (debe ser accesible desde animate)
    const controlData = {
        bumpScale: material.bumpScale
    };

    // Panel de controles
    const gui = new GUI();
    gui.add(controlData, 'bumpScale', -4, 4).step(0.1).name('bumpScale');

    // Animación: girar el cubo sobre el eje Y y enlazar el control con el material
    function animate() {
        requestAnimationFrame(animate);

        box.rotation.y += 0.01;

        // Enlazar el valor del control con la propiedad bumpScale del material
        material.bumpScale = controlData.bumpScale;

        renderer.render(scene, camera);

        // Actualizar el contador de framerate
        stats.update();
    }

    animate();

} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}
