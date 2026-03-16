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
    camera.position.set(0, 0, 500);
    
    // Crear un cubo
    const boxGeometry = new THREE.BoxGeometry(100, 100, 100);
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(-150, 0, 0);
    box.rotation.set(Math.PI / 5, Math.PI / 5, 0);
    scene.add(box);
    
    // Crear un cilindro
    const cylinderGeometry = new THREE.CylinderGeometry(50, 50, 100, 32);
    const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(0, 0, 0);
    cylinder.rotation.set(Math.PI / 5, Math.PI / 5, 0);
    scene.add(cylinder);
    
    // Crear una esfera
    const sphereGeometry = new THREE.SphereGeometry(50, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(150, 0, 0);
    scene.add(sphere);
    
    // Renderizar la escena
    renderer.render(scene, camera);
    
} else {
    // WebGL is not available
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}