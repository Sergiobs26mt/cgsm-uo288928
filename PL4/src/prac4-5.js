import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";

if (WEBGL.isWebGL2Available()) {
    const scene = new THREE.Scene();
    const screenVideo = document.getElementById("screenVideo");

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(0, 30, 0);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(0, 0.5, 100);
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf0f0f0, 0.6);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);

    const helper = new THREE.GridHelper(800, 40, 0x444444, 0x444444);
    helper.position.y = 0.1;
    scene.add(helper);

    screenVideo.load();

    const screenTexture = new THREE.VideoTexture(screenVideo);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;

    const screenFrame = new THREE.Mesh(
        new THREE.PlaneGeometry(250, 145),
        new THREE.MeshPhongMaterial({ color: 0x111111 })
    );
    screenFrame.position.set(0, 95, -260);
    scene.add(screenFrame);

    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(236, 133),
        new THREE.MeshBasicMaterial({ map: screenTexture })
    );
    screen.position.set(0, 95, -259.5);
    scene.add(screen);

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

    function setScreenState(isPlaying) {
        setCubeButtonState(cubeA, isPlaying);
        setCubeButtonState(cubeB, !isPlaying);
    }

    setScreenState(false);

    const controls = new FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 70;
    controls.lookSpeed = 0.05;
    controls.noFly = false;
    controls.lookVertical = false;

    const selectionRayCaster = new THREE.Raycaster();
    const collisionRayCaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const selectable = [cubeA, cubeB];
    let intersectedObject = null;

    const movements = [
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(1, 0, 1),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(1, 0, -1),
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(-1, 0, -1),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(-1, 0, 1)
    ];

    const collisionDistance = 20;

    function hasCollision() {
        for (const movement of movements) {
            const direction = movement.clone().applyQuaternion(camera.quaternion);
            direction.y = 0;

            if (direction.lengthSq() === 0) {
                continue;
            }

            direction.normalize();
            collisionRayCaster.set(camera.position, direction);
            const collisions = collisionRayCaster.intersectObjects(selectable, false);

            if (collisions.length > 0 && collisions[0].distance <= collisionDistance) {
                return true;
            }
        }

        return false;
    }

    document.body.addEventListener("mousemove", (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }, false);

    document.body.addEventListener("keydown", (event) => {
        const spaceKeyCode = "Space";

        if (event.code === spaceKeyCode && intersectedObject) {
            event.preventDefault();

            if (intersectedObject === cubeA) {
                const playPromise = screenVideo.play();
                if (playPromise !== undefined) {
                    playPromise.catch((error) => {
                        console.error("Video start failed:", error);
                    });
                }
                setScreenState(true);
            } else if (intersectedObject === cubeB) {
                screenVideo.pause();
                setScreenState(false);
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

        selectionRayCaster.setFromCamera(mouse, camera);
        const intersects = selectionRayCaster.intersectObjects(selectable, false);

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
        const previousPosition = camera.position.clone();
        controls.update(delta);

        if (camera.position.distanceToSquared(previousPosition) > 0 && hasCollision()) {
            controls.update(-delta);
        }

        renderer.render(scene, camera);
    }

    animate();
} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    document.body.appendChild(warning);
}
