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
    const sunLight = new THREE.PointLight(0xffffff, 2, 0, 0);
    sunLight.position.set(500, 200, 300);
    scene.add(sunLight);

    // Luz ambiental muy tenue para que la zona oscura no sea completamente negra
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    const textureLoader = new THREE.TextureLoader();

    // ---- TIERRA ----
    // El eje de rotación de la Tierra está inclinado ~23° respecto al plano orbital
    const AXIAL_TILT = 23 * Math.PI / 180;

    // Nodo padre que aplica la inclinación axial al conjunto Tierra+Atmósfera
    const earthSystem = new THREE.Object3D();
    earthSystem.rotation.z = AXIAL_TILT;
    scene.add(earthSystem);

    // Superficie terrestre
    const earthMap = textureLoader.load("textures/earth.png",
        () => { renderer.render(scene, camera); }
    );
    const earthGeometry = new THREE.SphereGeometry(100, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthMap,
        specular: new THREE.Color(0x333333),
        shininess: 15
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthSystem.add(earth);

    // ---- ATMÓSFERA (nubes) ----
    // Esfera ligeramente mayor que la Tierra, con textura de nubes transparente
    const atmosphereMap = textureLoader.load("textures/atmosphere.png",
        () => { renderer.render(scene, camera); }
    );
    const atmosphereMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        map: atmosphereMap,
        transparent: true   // Necesario para que las zonas sin nubes sean transparentes
    });
    const atmosphereGeometry = new THREE.SphereGeometry(102, 64, 64); // ligeramente mayor
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthSystem.add(atmosphere);

    // Renderizado inicial
    renderer.render(scene, camera);

} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}
