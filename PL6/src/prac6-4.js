import adapter from 'webrtc-adapter';
import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';

if (WEBGL.isWebGL2Available()) {

    const overlay = document.getElementById('overlay');
    const video   = document.getElementById('video');

    // Pedir permisos de la cámara web
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
            video.srcObject = stream;
            video.play(); // Forzar la reproducción
            overlay.style.display = 'none'; // Ocultar el cartel de carga
            initScene();
        })
        .catch((error) => {
            console.error('Error al acceder a la cámara WebRTC:', error);
            overlay.innerHTML = '<div style="color:red; text-align:center;">Error: No se pudo acceder a la cámara web.</div>';
        });

    function initScene() {
        // Escena con fondo blanco
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        // Renderizador
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Cámara
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
        camera.position.set(0, 0, 600);

        // Canvas intermedio con dimensiones para la textura
        const image = document.createElement('canvas');
        image.width  = 640;
        image.height = 480;
        const imageContext = image.getContext('2d');
        imageContext.fillStyle = '#000000';
        imageContext.fillRect(0, 0, image.width, image.height);

        // Textura a partir del canvas
        const texture = new THREE.Texture(image);

        // Plano
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(image.width, image.height, 4, 4),
            material
        );
        scene.add(wall);

        // Animación
        function animate() {
            requestAnimationFrame(animate);

            wall.rotation.y += 0.005;

            // Copiar el frame actual del vídeo de la cámara al canvas y actualizar la textura
            // Se usa >= HAVE_CURRENT_DATA (2) porque WebRTC a veces no alcanza HAVE_ENOUGH_DATA (4)
            if (video.readyState >= video.HAVE_CURRENT_DATA) {
                imageContext.drawImage(video, 0, 0, image.width, image.height);
                if (texture) texture.needsUpdate = true;
            }

            renderer.render(scene, camera);
        }

        animate();

        // Adaptar al redimensionar la ventana
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}
