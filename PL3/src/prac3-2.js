import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'three/examples/jsm/libs/stats.module';

if (WEBGL.isWebGL2Available()) {

    const overlay = document.getElementById('overlay');
    const playBtn = document.getElementById('playBtn');
    const video   = document.getElementById('video');

    playBtn.addEventListener('click', () => {
        video.play();
        overlay.style.display = 'none';
        initScene();
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

        // Canvas intermedio con las dimensiones del vídeo
        const image = document.createElement('canvas');
        image.width  = 480; // Ancho del vídeo
        image.height = 204; // Alto del vídeo
        const imageContext = image.getContext('2d');
        imageContext.fillStyle = '#000000';
        imageContext.fillRect(0, 0, image.width - 1, image.height - 1);

        // Textura a partir del canvas
        const texture = new THREE.Texture(image);

        // Plano con las mismas dimensiones que el vídeo
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(image.width, image.height, 4, 4),
            material
        );
        scene.add(wall);

        // Controles GUI
        const params = { Pause: false };
        const gui = new GUI();
        gui.add(params, 'Pause');

        // Framerate counter
        const stats = new Stats();
        stats.dom.style.position = 'absolute';
        stats.dom.style.top = '0px';
        document.body.appendChild(stats.dom);

        // Animación
        function animate() {
            requestAnimationFrame(animate);

            if (!params.Pause) {
                wall.rotation.y += 0.005;
            }

            // Copiar el frame actual del vídeo al canvas y actualizar la textura
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                imageContext.drawImage(video, 0, 0, image.width, image.height);
                if (texture) texture.needsUpdate = true;
            }

            renderer.render(scene, camera);
            stats.update();
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
