import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'three/examples/jsm/libs/stats.module';

if (WEBGL.isWebGL2Available()) {

    const overlay = document.getElementById('overlay');
    const playBtn = document.getElementById('playBtn');
    const video   = document.getElementById('video');

    playBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        video.load();
        video.addEventListener('loadedmetadata', () => {
            video.currentTime = video.duration;
            initScene();
        }, { once: true });
    });

    function initScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
        camera.position.set(0, 0, 600);

        const image = document.createElement('canvas');
        image.width  = 480;
        image.height = 204;
        const imageContext = image.getContext('2d');
        imageContext.fillStyle = '#000000';
        imageContext.fillRect(0, 0, image.width - 1, image.height - 1);

        const texture = new THREE.Texture(image);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(image.width, image.height, 4, 4),
            material
        );
        scene.add(wall);

        const params = { Pause: false };
        const gui = new GUI();
        gui.add(params, 'Pause');

        // Framerate counter
        const stats = new Stats();
        stats.dom.style.position = 'absolute';
        stats.dom.style.top = '0px';
        document.body.appendChild(stats.dom);

        // Paso en segundos entre frames inversos (≈30 fps)
        const FRAME_STEP = 1 / 30;

        // Lanzar el siguiente seek hacia atrás
        function seekPrevFrame() {
            if (params.Pause) return;
            const next = video.currentTime - FRAME_STEP;
            video.currentTime = next <= 0 ? video.duration : next;
        }

        // Al completarse cada seek: dibujar el frame y pedir el siguiente
        video.addEventListener('seeked', () => {
            imageContext.drawImage(video, 0, 0, image.width, image.height);
            texture.needsUpdate = true;
            seekPrevFrame();
        });

        // Arrancar la cadena de seeks
        seekPrevFrame();

        // Bucle de animación: solo rota el plano y renderiza
        function animate() {
            requestAnimationFrame(animate);
            if (!params.Pause) {
                wall.rotation.y += 0.005;
            }
            renderer.render(scene, camera);
            stats.update();
        }

        animate();

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
