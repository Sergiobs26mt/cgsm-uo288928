import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'three/examples/jsm/libs/stats.module';

if (WEBGL.isWebGL2Available()) {
    const overlay = document.getElementById('overlay');
    const playBtn = document.getElementById('playBtn');
    const video = document.getElementById('video');

    const query = new URLSearchParams(window.location.search);
    const url = query.get('mpd') || 'http://localhost:60080/EJERCICIO/sintel.mpd';

    let player;

    playBtn.addEventListener('click', async () => {
        if (!window.dashjs) {
            console.error('dash.js no está cargado.');
            return;
        }

        if (!player) {
            player = window.dashjs.MediaPlayer().create();
            player.initialize(video, url, false);
            player.updateSettings({
                streaming: {
                    abr: {
                        autoSwitchBitrate: {
                            video: true,
                            audio: true
                        }
                    }
                }
            });
        }

        try {
            await video.play();
            overlay.style.display = 'none';
            initScene(video);
        } catch (err) {
            console.error('No se pudo iniciar la reproducción del vídeo DASH:', err);
        }
    }, { once: true });

    function initScene(videoElement) {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
        camera.position.set(0, 0, 600);

        const image = document.createElement('canvas');
        image.width = 480;
        image.height = 270;
        const imageContext = image.getContext('2d');
        imageContext.fillStyle = '#000000';
        imageContext.fillRect(0, 0, image.width, image.height);

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

        const stats = new Stats();
        stats.dom.style.position = 'absolute';
        stats.dom.style.top = '0px';
        document.body.appendChild(stats.dom);

        function animate() {
            requestAnimationFrame(animate);

            if (!params.Pause) {
                wall.rotation.y += 0.005;
            }

            if (videoElement.readyState >= videoElement.HAVE_CURRENT_DATA) {
                imageContext.drawImage(videoElement, 0, 0, image.width, image.height);
                texture.needsUpdate = true;
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
