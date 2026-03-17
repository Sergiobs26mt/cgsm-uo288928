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
    const sunLight = new THREE.PointLight(0xffffff, 2, 0, 0);
    sunLight.position.set(500, 200, 300);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    const textureLoader = new THREE.TextureLoader();

    // ---- TAMAÑOS (escala relativa: Tierra = 1) ----
    const earthRadius = 100;
    const moonRadius  = earthRadius * 0.27;   // La Luna mide 0.27 veces la Tierra

    // Distancia visual Tierra–Luna. La posición en XZ se calcula como:
    //   moon.position = ( sqrt(distance/2), 0, -sqrt(distance/2) )
    // con lo que la distancia total al origen = sqrt(distance).
    // Para situar la Luna a 200 unidades del centro → distance = 200² = 40000
    const distance = 40000;

    // ---- SISTEMA TIERRA (inclinación axial 23° = 0.36 rad sobre eje Z) ----
    const earthSystem = new THREE.Object3D();
    earthSystem.rotation.z = 0.36;
    scene.add(earthSystem);

    // Superficie terrestre
    const earthMap = textureLoader.load("textures/earth.png",
        () => { renderer.render(scene, camera); }
    );
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthMap,
        specular: new THREE.Color(0x333333),
        shininess: 15
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthSystem.add(earth);

    // Atmósfera (nubes transparentes)
    const atmosphereMap = textureLoader.load("textures/atmosphere.png",
        () => { renderer.render(scene, camera); }
    );
    const atmosphereMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        map: atmosphereMap,
        transparent: true
    });
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.02, 64, 64);
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthSystem.add(atmosphere);

    // ---- LUNA ----
    const moonMapUrl = 'textures/moon.png';
    const moonMap = textureLoader.load(moonMapUrl, () => { renderer.render(scene, camera); });
    const moonMaterial = new THREE.MeshLambertMaterial({ map: moonMap, color: 0x888888 });

    const moonGeometry = new THREE.SphereGeometry(moonRadius, 32, 32);
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);

    // Alejar la Luna del origen (la Tierra). No está a escala real.
    // Real value: Math.sqrt( distance * distance / 2 )
    moon.position.set(Math.sqrt(distance / 2), 0, -Math.sqrt(distance / 2));

    // Rotar la Luna para mostrar la cara visible hacia la Tierra (bloqueo de marea)
    moon.rotation.y = Math.PI;

    // La Luna orbita alrededor de la Tierra → necesita un Object3D contenedor
    const moonGroup = new THREE.Object3D();
    moonGroup.add(moon);

    // La órbita lunar está ligeramente inclinada (~5.1° ≈ 0.089 rad)
    moonGroup.rotation.x = 0.089;

    scene.add(moonGroup);

    // Renderizado inicial
    renderer.render(scene, camera);

} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}
