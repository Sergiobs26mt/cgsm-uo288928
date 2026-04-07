import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';

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
    camera.position.set(0, 0, 400);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Texturas
    const textureLoader = new THREE.TextureLoader();
    const brickTexture = textureLoader.load('textures/brick.jpeg');
    const brickBumpMap = textureLoader.load('textures/brick-map.jpeg');

    // Cubo izquierdo: solo textura básica
    const geometryL = new THREE.BoxGeometry(100, 100, 100);
    const materialL = new THREE.MeshPhongMaterial({ map: brickTexture });
    const boxLeft = new THREE.Mesh(geometryL, materialL);
    boxLeft.position.set(-80, 0, 0);
    boxLeft.rotation.set(Math.PI / 5, Math.PI / 5, 0);
    scene.add(boxLeft);

    // Cubo derecho: textura + mapa topológico (bump map)
    const geometryR = new THREE.BoxGeometry(100, 100, 100);
    const materialR = new THREE.MeshPhongMaterial({
        map: brickTexture,
        bumpMap: brickBumpMap,
        bumpScale: 10
    });
    const boxRight = new THREE.Mesh(geometryR, materialR);
    boxRight.position.set(80, 0, 0);
    boxRight.rotation.set(Math.PI / 5, Math.PI / 5, 0);
    scene.add(boxRight);

    // Animación: girar ambos cubos sobre el eje Y
    function animate() {
        requestAnimationFrame(animate);
        boxLeft.rotation.y += 0.01;
        boxRight.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();

} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}
