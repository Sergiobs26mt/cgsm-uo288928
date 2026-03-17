import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';

// Importar los shaders como strings (gracias a webpack-glsl-loader)
const vertexShader   = require( './shaders/vertex.glsl' );
const fragmentShader = require( './shaders/fragment.glsl' );

if (WEBGL.isWebGL2Available()) {
    console.log('WebGL2 is available');

    // Crear la escena
    const scene = new THREE.Scene();

    // Crear el renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Crear la cámara — alejada para ver tanto la Tierra como el Sol
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 8000);
    camera.position.set(0, 0, 1500);

    // ---- LUZ ----
    // La PointLight simula el Sol; el Sol estará en la misma posición
    const SUN_POS = new THREE.Vector3(500, 200, 300);

    const sunLight = new THREE.PointLight(0xffffff, 2, 0, 0);
    sunLight.position.copy(SUN_POS);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    const textureLoader = new THREE.TextureLoader();

    // ---- TAMAÑOS ----
    const earthRadius = 100;
    const moonRadius  = earthRadius * 0.27;
    const distance    = 40000;
    const sunRadius   = earthRadius * 5;  // El Sol es 5 veces la Tierra

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

    // ---- SOL (ShaderMaterial) ----
    const NOISEMAP = 'textures/cloud.png';
    const SUNMAP   = 'textures/lavatile.png';

    const uniforms = {
        "fogDensity": { value: 0 },
        "fogColor":   { value: new THREE.Vector3(0, 0, 0) },
        "time":       { value: 1.0 },
        "uvScale":    { value: new THREE.Vector2(3.0, 1.0) },
        "texture1":   { value: textureLoader.load(NOISEMAP) },
        "texture2":   { value: textureLoader.load(SUNMAP) }
    };

    uniforms["texture1"].value.wrapS = uniforms["texture1"].value.wrapT = THREE.RepeatWrapping;
    uniforms["texture2"].value.wrapS = uniforms["texture2"].value.wrapT = THREE.RepeatWrapping;

    const sunMaterial = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader
    });

    const sunGeometry = new THREE.SphereGeometry(sunRadius, 64, 64);
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(SUN_POS);   // El Sol está en el mismo punto que la PointLight
    scene.add(sun);

    // ---- ANIMACIÓN ----
    const EARTH_DAY_S  = 24;
    const MOON_ORBIT_S = 28 * EARTH_DAY_S;   // 672 s por órbita lunar

    const clock = new THREE.Clock();

    function animate() {
        const delta = clock.getDelta();

        // Tierra y atmósfera
        const earthRot = (delta * Math.PI * 2) / EARTH_DAY_S;
        earthGlobe.rotation.y += earthRot;
        atmosphere.rotation.y  += earthRot * 0.95;

        // Órbita de la Luna
        moonGroup.rotation.y += (delta * Math.PI * 2) / MOON_ORBIT_S;

        // Animación de la superficie del Sol
        uniforms[ "time" ].value += 0.2 * delta;

        // Rotación del Sol sobre su eje
        sun.rotation.y += delta * 0.03;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}
