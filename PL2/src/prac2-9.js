import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

if (WEBGL.isWebGL2Available()) {
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

    // ---- LUCES ----
    const ambientLight = new THREE.AmbientLight(0x888888);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(500, 500, 500);
    scene.add(dirLight);

    // ---- CARGA DEL MODELO COLLADA ----
    const modelUrl = "models/iss.dae";
    let iss;

    const loadingManager = new THREE.LoadingManager( () => {

        scene.add( iss );
        console.log( 'Model loaded' );

        // Renderizar la escena una vez cargado el modelo
        renderer.render( scene, camera );
    } );

    const loader = new ColladaLoader( loadingManager );
    loader.load( modelUrl, ( collada ) => {

        iss = collada.scene;
        iss.scale.x = iss.scale.y = iss.scale.z = 0.3;
        iss.rotation.set( Math.PI / 5, Math.PI / 5, 0 );
        iss.updateMatrix( );
    } );

    // ---- ANIMACIÓN ----
    const clock = new THREE.Clock();

    function animate() {
        const delta = clock.getDelta();

        // Rotar la ISS suavemente si ya está cargada
        if (iss) {
            iss.rotation.y += delta * 0.3;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
    console.error('WebGL2 is not available');
}
