import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';

if (WEBGL.isWebGL2Available()) {
    // WebGL is available
    console.log('WebGL2 is available');

    // Crear la escena
    const scene = new THREE.Scene();

    // Crear el renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Crear la cámara
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(0, 0, 300);

    // Cargar la textura y crear el material del cubo
    const mapUrl = "textures/crate.gif";             // The file used as texture
    const textureLoader = new THREE.TextureLoader(); // The object used to load textures
    const map = textureLoader.load(
        mapUrl,
        (loaded) => { renderer.render(scene, camera); }  // Callback: re-render once texture is loaded
    );
    const material = new THREE.MeshBasicMaterial({ map: map });

    // Crear la geometría del cubo
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const box = new THREE.Mesh(geometry, material);

    // Rotar el cubo para apreciar las tres dimensiones
    box.rotation.set(Math.PI / 5, Math.PI / 5, 0);

    // Añadir el cubo a la escena
    scene.add(box);

    // Renderizar la escena (primera vez; la textura puede aún no estar cargada)
    renderer.render(scene, camera);

} else {
    // WebGL is not available
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}
