import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';

if (WEBGL.isWebGL2Available()) {
    console.log('WebGL2 is available');

    // Escena
    const scene = new THREE.Scene();

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Cámara a altura de los ojos (primera persona)
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(0, 30, 0);

    // ── Luces ────────────────────────────────────────────────────────────────

    // Luz direccional blanca en (0, 0.5, 100)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(0, 0.5, 100);
    scene.add(dirLight);

    // Luz hemisférica para simular luz natural
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf0f0f0, 0.6);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);

    // ── Suelo (rejilla) ──────────────────────────────────────────────────────
    const helper = new THREE.GridHelper(800, 40, 0x444444, 0x444444);
    helper.position.y = 0.1;
    scene.add(helper);

    // ── Texturas ─────────────────────────────────────────────────────────────
    const textureLoader = new THREE.TextureLoader();

    // Textura especial (cara frontal) — Figuras 3 y 4 del enunciado
    const specialTex = textureLoader.load('textures/brick-with-button.jpeg');
    const specialBump = textureLoader.load('textures/brick-map-with-button.jpeg');

    // Textura regular (resto de caras) — ladrillo de la sección anterior
    const brickTex = textureLoader.load('textures/brick.jpeg');
    const brickBump = textureLoader.load('textures/brick-map.jpeg');

    // ── Materiales ───────────────────────────────────────────────────────────
    const specialFaceMaterial = new THREE.MeshPhongMaterial({
        map: specialTex,
        bumpMap: specialBump,
        bumpScale: 2
    });
    const regularFaceMaterial = new THREE.MeshPhongMaterial({
        map: brickTex,
        bumpMap: brickBump,
        bumpScale: 2
    });

    // Array de 6 materiales: [+x, -x, +y, -y, +z, -z]
    // La cara especial (+z, índice 4) queda enfrentada al observador
    const materialsA = [
        regularFaceMaterial,
        regularFaceMaterial,
        regularFaceMaterial,
        regularFaceMaterial,
        specialFaceMaterial,   // cara frontal cubo A (mira hacia +Z)
        regularFaceMaterial
    ];

    // La cara especial del cubo B (-z, índice 5) queda encarada al cubo A
    const materialsB = [
        regularFaceMaterial,
        regularFaceMaterial,
        regularFaceMaterial,
        regularFaceMaterial,
        regularFaceMaterial,
        specialFaceMaterial    // cara frontal cubo B (mira hacia -Z)
    ];

    // ── Cubos ────────────────────────────────────────────────────────────────
    const size = 50;

    const cubeA = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), materialsA);
    cubeA.position.set(-150, size / 2, 0);   // posado en el suelo, a la izquierda
    scene.add(cubeA);

    const cubeB = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), materialsB);
    cubeB.position.set(150, size / 2, 0);    // posado en el suelo, a la derecha
    scene.add(cubeB);

    // ── Controles de cámara en primera persona ────────────────────────────────
    const controls = new FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 70;
    controls.lookSpeed = 0.05;
    controls.noFly = false;
    controls.lookVertical = false;

    // Reloj para calcular el delta de tiempo
    const clock = new THREE.Clock();

    // ── Adaptación al redimensionado ──────────────────────────────────────────
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── Ciclo de renderizado ─────────────────────────────────────────────────
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        controls.update(delta);
        renderer.render(scene, camera);
    }

    animate();

} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}
