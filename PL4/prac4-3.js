import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";

if (WEBGL.isWebGL2Available()) {
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(0, 30, 0);

    const listener = new THREE.AudioListener();
    camera.add(listener);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(0, 0.5, 100);
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf0f0f0, 0.6);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);

    const helper = new THREE.GridHelper(800, 40, 0x444444, 0x444444);
    helper.position.y = 0.1;
    scene.add(helper);

    const textureLoader = new THREE.TextureLoader();
    const buttonOffTex = textureLoader.load("textures/brick-with-button.jpeg");
    const buttonOnTex = textureLoader.load("textures/brick-with-button-activated.png");
    const buttonBump = textureLoader.load("textures/brick-map-with-button.jpeg");
    const brickTex = textureLoader.load("textures/brick.jpeg");
    const brickBump = textureLoader.load("textures/brick-map.jpeg");

    const buttonOffMaterial = new THREE.MeshPhongMaterial({
        map: buttonOffTex,
        bumpMap: buttonBump,
        bumpScale: 2
    });

    const buttonOnMaterial = new THREE.MeshPhongMaterial({
        map: buttonOnTex,
        bumpMap: buttonBump,
        bumpScale: 2
    });

    const regularFaceMaterial = new THREE.MeshPhongMaterial({
        map: brickTex,
        bumpMap: brickBump,
        bumpScale: 2
    });

    const materialsA = [
        regularFaceMaterial,
        regularFaceMaterial,
        regularFaceMaterial,
        regularFaceMaterial,
        buttonOffMaterial,
        regularFaceMaterial
    ];

    const materialsB = [
        regularFaceMaterial,
        regularFaceMaterial,
        regularFaceMaterial,
        regularFaceMaterial,
        regularFaceMaterial,
        buttonOffMaterial
    ];

    const size = 50;

    const cubeA = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), materialsA);
    cubeA.position.set(-150, size / 2, 0);
    cubeA.name = "Cube A";
    scene.add(cubeA);

    const cubeB = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), materialsB);
    cubeB.position.set(150, size / 2, 0);
    cubeB.name = "Cube B";
    scene.add(cubeB);

    const buttonFaceIndexByName = {
        "Cube A": 4,
        "Cube B": 5
    };

    function setCubeButtonState(cube, isActive) {
        const faceIndex = buttonFaceIndexByName[cube.name];
        if (faceIndex === undefined) {
            return;
        }

        cube.material[faceIndex] = isActive ? buttonOnMaterial : buttonOffMaterial;
        cube.material.needsUpdate = true;
    }

    const audioLoader = new THREE.AudioLoader();

    function createSoundForMesh(mesh, filePath) {
        const sound = new THREE.PositionalAudio(listener);

        audioLoader.load(
            filePath,
            (buffer) => {
                sound.setBuffer(buffer);
                sound.setRefDistance(20);
                sound.setLoop(true);
                sound.setRolloffFactor(1);
            },
            undefined,
            (error) => {
                console.error(`Error loading audio ${filePath}:`, error);
            }
        );

        mesh.add(sound);
        return sound;
    }

    const soundA = createSoundForMesh(cubeA, "audio/376737_Skullbeatz___Bad_Cat_Maste.ogg");
    const soundB = createSoundForMesh(cubeB, "audio/dog.ogg");

    const controls = new FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 70;
    controls.lookSpeed = 0.05;
    controls.noFly = false;
    controls.lookVertical = false;

    const rayCaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const selectable = [cubeA, cubeB];
    let intersectedObject = null;

    document.body.addEventListener("mousemove", (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }, false);

    document.body.addEventListener("keydown", (event) => {
        const spaceKeyCode = "Space";

        if (event.code === spaceKeyCode && intersectedObject) {
            event.preventDefault();

            if (listener.context.state === "suspended") {
                listener.context.resume();
            }

            let selectedSound = null;
            if (intersectedObject === cubeA) {
                selectedSound = soundA;
            } else if (intersectedObject === cubeB) {
                selectedSound = soundB;
            }

            if (!selectedSound || !selectedSound.buffer) {
                return;
            }

            if (selectedSound.isPlaying === true) {
                selectedSound.pause();
                setCubeButtonState(intersectedObject, false);
            } else {
                selectedSound.play();
                setCubeButtonState(intersectedObject, true);
            }
        }
    }, false);

    const clock = new THREE.Clock();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        controls.handleResize();
    });

    function animate() {
        requestAnimationFrame(animate);

        rayCaster.setFromCamera(mouse, camera);
        const intersects = rayCaster.intersectObjects(selectable, false);

        if (intersects.length > 0) {
            if (intersectedObject !== intersects[0].object) {
                intersectedObject = intersects[0].object;
                console.log("New intersected object: " + intersectedObject.name);
            }
        } else {
            intersectedObject = null;
        }

        renderer.domElement.style.cursor = intersectedObject ? "pointer" : "default";

        const delta = clock.getDelta();
        controls.update(delta);
        renderer.render(scene, camera);
    }

    animate();
} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
}
