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
    
    // Crear la cámara (más alejada para ver todos los objetos)
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(0, 0, 700);
    
    // Crear un cubo
    const boxGeometry = new THREE.BoxGeometry(100, 100, 100);
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(-200, 0, 0);
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
    sphere.position.set(200, 0, 0);
    scene.add(sphere);
    
    // Crear geometría personalizada en forma de casa con ventanas y puerta huecas
    const houseGeometry = new THREE.BufferGeometry();

    const outer = 80;
    const roofHeight = 100;

    const vertices = new Float32Array([
        // Contorno exterior base
        -outer, -outer, 0,
        outer, -outer, 0,
        outer, outer, 0,
        -outer, outer, 0,

        // Ventana izquierda
        -65, 30, 0,
        -35, 30, 0,
        -35, -10, 0,
        -65, -10, 0,

        // Ventana derecha
        35, 30, 0,
        65, 30, 0,
        65, -10, 0,
        35, -10, 0,

        // Puerta
        -18, -10, 0,
        18, -10, 0,
        18, -outer, 0,
        -18, -outer, 0,

        // Tejado
        -outer, outer, 0,
        outer, outer, 0,
        0, outer + roofHeight, 0
    ]);

    // Caras (triángulos), dejando huecos de ventanas y puerta
    const indices = [
        // Franja superior (entre techo y ventanas)
        3, 7, 4,
        3, 4, 5,
        3, 5, 8,
        3, 8, 9,
        3, 9, 2,
        2, 9, 10,

        // Lateral izquierdo (entre borde izq y vent izq)
        3, 0, 7,
        0, 6, 7,

        // Lateral derecho (entre vent der y borde der)
        2, 10, 1,
        1, 10, 11,

        // Franja central (entre las dos ventanas, sobre la puerta)
        5, 6, 11,
        5, 11, 8,

        // Franja izquierda de puerta
        6, 0, 15,
        6, 15, 12,

        // Franja derecha de puerta
        11, 13, 14,
        11, 14, 1,
        11, 12, 13,
        10, 11, 1,

        // Suelo (debajo de ventanas, a los lados de la puerta)
        0, 1, 15,
        1, 14, 15,

        // Tejado
        3, 2, 18
    ];

    houseGeometry.setIndex(indices);
    houseGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    houseGeometry.computeVertexNormals();
    
    const houseMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600, side: THREE.DoubleSide });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.set(400, 0, 0);
    scene.add(house);
    
    // Renderizar la escena
    renderer.render(scene, camera);
    
} else {
    // WebGL is not available
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}