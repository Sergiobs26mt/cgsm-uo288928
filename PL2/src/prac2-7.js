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

    // ---- TAMAÑOS ----
    const earthRadius = 100;
    const moonRadius  = earthRadius * 0.27;
    const distance    = 40000;

    // ---- SISTEMA TIERRA (inclinación axial 23° = 0.36 rad) ----
    const earthSystem = new THREE.Object3D();
    earthSystem.rotation.z = 0.36;
    scene.add(earthSystem);

    // Superficie terrestre
    const earthMap = textureLoader.load("textures/earth.png");
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthMap,
        specular: new THREE.Color(0x333333),
        shininess: 15
    });
    const earthGlobe = new THREE.Mesh(earthGeometry, earthMaterial);
    earthSystem.add(earthGlobe);

    // Atmósfera (nubes transparentes)
    const atmosphereMap = textureLoader.load("textures/atmosphere.png");
    const atmosphereMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        map: atmosphereMap,
        transparent: true
    });
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.02, 64, 64);
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthSystem.add(atmosphere);

    // ---- LUNA ----
    const moonMap = textureLoader.load("textures/moon.png");
    const moonMaterial = new THREE.MeshLambertMaterial({ map: moonMap, color: 0x888888 });

    const moonGeometry = new THREE.SphereGeometry(moonRadius, 32, 32);
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);

    moon.position.set(Math.sqrt(distance / 2), 0, -Math.sqrt(distance / 2));
    moon.rotation.y = Math.PI;

    const moonGroup = new THREE.Object3D();
    moonGroup.add(moon);
    moonGroup.rotation.x = 0.089;
    scene.add(moonGroup);

    // ---- ANIMACIÓN ----
    // Escala de tiempo: la Tierra completa 1 día = 1 vuelta en 24 segundos.
    // La Luna completa su órbita en 28 días → 28 × 24 s = 672 s por vuelta.
    const EARTH_DAY_S  = 24;                            // segundos de simulación por día terrestre
    const MOON_ORBIT_S = 28 * EARTH_DAY_S;              // 672 s por órbita lunar

    const clock = new THREE.Clock();

    function animate() {

        const delta = clock.getDelta(); // Tiempo transcurrido en segundos

        // Rotación de la Tierra y la atmósfera
        const earthRot = (delta * Math.PI * 2) / EARTH_DAY_S;
        earthGlobe.rotation.y += earthRot;
        atmosphere.rotation.y  += earthRot * 0.95;

        // Órbita de la Luna alrededor de la Tierra (rotación del moonGroup)
        const moonOrbit = (delta * Math.PI * 2) / MOON_ORBIT_S;
        moonGroup.rotation.y += moonOrbit;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}
