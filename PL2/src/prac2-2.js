import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';

if (WEBGL.isWebGL2Available()) {
    console.log('WebGL2 is available');

    // Crear la escena
    const scene = new THREE.Scene();

    // Crear el renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Crear la cámara
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(0, 0, 500);

    // ---- LUZ ----
    // PointLight que simula el Sol, situado lateralmente fuera de la escena
    // decay=0 para evitar atenuación con la distancia (comportamiento clásico)
    const sunLight = new THREE.PointLight(0xffffff, 2, 0, 0);
    sunLight.position.set(500, 200, 300);
    scene.add(sunLight);

    // Luz ambiental muy tenue para que la zona oscura no sea completamente negra
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    // ---- TIERRA ----
    // Cargar la textura de la superficie terrestre
    const mapUrl = "textures/earth.png";             // Textura de la superficie terrestre
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load(
        mapUrl,
        (loaded) => { renderer.render(scene, camera); }  // Re-render al terminar la carga
    );

    // Esfera con material Phong (componentes ambiental, difusa y especular)
    const earthGeometry = new THREE.SphereGeometry(100, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthMap,           // Textura difusa de la Tierra
        specular: new THREE.Color(0x333333),  // Brillo especular moderado
        shininess: 15
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Renderizado inicial
    renderer.render(scene, camera);

} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}
