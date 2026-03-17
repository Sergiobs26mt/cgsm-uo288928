import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

const vertexShader = require('./shaders/vertex.glsl');
const fragmentShader = require('./shaders/fragment.glsl');

if (WEBGL.isWebGL2Available()) {
    console.log('WebGL2 is available');

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Camera — elevated slightly to appreciate the orbital motion
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 400, 1800);
    camera.lookAt(0, 0, 0);

    // --------------------------------------------------------
    // SIZES
    // --------------------------------------------------------
    const earthRadius = 60;
    const moonRadius = earthRadius * 0.27;     // ~16
    const sunRadius = 200;
    const earthOrbitRadius = 700;   // Sun-to-Earth distance (not to scale)

    // --------------------------------------------------------
    // LIGHTS
    // --------------------------------------------------------
    // PointLight at Sun's position (origin)
    const sunLight = new THREE.PointLight(0xffffff, 2, 0, 0);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    const textureLoader = new THREE.TextureLoader();

    // --------------------------------------------------------
    // SUN  (ShaderMaterial — lava/plasma effect)
    // --------------------------------------------------------
    const uniforms = {
        "fogDensity": { value: 0 },
        "fogColor": { value: new THREE.Vector3(0, 0, 0) },
        "time": { value: 1.0 },
        "uvScale": { value: new THREE.Vector2(3.0, 1.0) },
        "texture1": { value: textureLoader.load("textures/cloud.png") },
        "texture2": { value: textureLoader.load("textures/lavatile.png") }
    };
    uniforms["texture1"].value.wrapS = uniforms["texture1"].value.wrapT = THREE.RepeatWrapping;
    uniforms["texture2"].value.wrapS = uniforms["texture2"].value.wrapT = THREE.RepeatWrapping;

    const sunMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const sun = new THREE.Mesh(new THREE.SphereGeometry(sunRadius, 64, 64), sunMaterial);
    scene.add(sun);

    // --------------------------------------------------------
    // EARTH ORBIT GROUP  (rotates around origin = Sun)
    // --------------------------------------------------------
    const earthOrbitGroup = new THREE.Object3D();
    scene.add(earthOrbitGroup);

    // EARTH SYSTEM  (axial tilt 23° = 0.36 rad)
    const earthSystem = new THREE.Object3D();
    earthSystem.position.x = earthOrbitRadius;
    earthSystem.rotation.z = 0.36;
    earthOrbitGroup.add(earthSystem);

    // Earth globe
    const earthMap = textureLoader.load("textures/earth.png");
    const earthGlobe = new THREE.Mesh(
        new THREE.SphereGeometry(earthRadius, 64, 64),
        new THREE.MeshPhongMaterial({ map: earthMap, specular: 0x333333, shininess: 15 })
    );
    earthSystem.add(earthGlobe);

    // Atmosphere
    const atmosphereMap = textureLoader.load("textures/atmosphere.png");
    const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(earthRadius * 1.02, 64, 64),
        new THREE.MeshLambertMaterial({ color: 0xffffff, map: atmosphereMap, transparent: true })
    );
    earthSystem.add(atmosphere);

    // --------------------------------------------------------
    // MOON ORBIT  (around Earth, tilt 0.089 rad ≈ 5.1°)
    // --------------------------------------------------------
    const moonGroup = new THREE.Object3D();
    moonGroup.rotation.x = 0.089;
    earthSystem.add(moonGroup);   // ← child of earthSystem → orbits with Earth

    const moonMap = textureLoader.load("textures/moon.png");
    const moon = new THREE.Mesh(
        new THREE.SphereGeometry(moonRadius, 32, 32),
        new THREE.MeshLambertMaterial({ map: moonMap, color: 0x888888 })
    );
    // Place moon at ~125 units from Earth center
    const moonDist = 8000;
    moon.position.set(Math.sqrt(moonDist / 2), 0, -Math.sqrt(moonDist / 2));
    moon.rotation.y = Math.PI;
    moonGroup.add(moon);

    // --------------------------------------------------------
    // ISS  (loaded from COLLADA, orbiting Earth)
    // --------------------------------------------------------
    const issOrbitGroup = new THREE.Object3D();
    issOrbitGroup.rotation.x = 0.45;   // inclined orbit
    earthSystem.add(issOrbitGroup);

    let iss;
    const loadingManager = new THREE.LoadingManager(() => {
        issOrbitGroup.add(iss);
        console.log('ISS model loaded');
    });

    const colladaLoader = new ColladaLoader(loadingManager);
    colladaLoader.load('models/iss.dae', (collada) => {
        iss = collada.scene;
        iss.scale.setScalar(0.4);
        iss.position.set(80, 0, 0);
        iss.rotation.set(Math.PI / 4, 0, 0);
        iss.updateMatrix();
    });

    // --------------------------------------------------------
    // ANIMATION
    // --------------------------------------------------------
    // Timescale: 1 Earth day = 24 simulation seconds
    const DAY = 24;
    const clock = new THREE.Clock();

    function animate() {
        const delta = clock.getDelta();

        // Sun surface animation
        uniforms["time"].value += 0.2 * delta;
        sun.rotation.y += delta * 0.02;

        // Earth self-rotation (1 day = 24 s)
        const earthRot = (delta * Math.PI * 2) / DAY;
        earthGlobe.rotation.y += earthRot;
        atmosphere.rotation.y += earthRot * 0.95;

        // Earth orbit around Sun (visible speed: 60 s per revolution)
        earthOrbitGroup.rotation.y += (delta * Math.PI * 2) / 60;

        // Moon orbit around Earth (visible speed: 15 s per revolution)
        moonGroup.rotation.y += (delta * Math.PI * 2) / 15;

        // ISS orbit around Earth (fast — ~90 min real → 3 s simulation)
        issOrbitGroup.rotation.y += (delta * Math.PI * 2) / 3;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

} else {
    document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
}
