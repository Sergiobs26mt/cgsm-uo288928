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
    
    // Crear la geometría y el material del cubo
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshBasicMaterial();
    const box = new THREE.Mesh(geometry, material);
    
    // Añadir el cubo a la escena
    scene.add(box);
    
    // Renderizar la escena
    renderer.render(scene, camera);
    
} else {
    // WebGL is not available
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}