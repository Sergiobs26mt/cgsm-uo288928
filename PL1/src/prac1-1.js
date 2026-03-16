import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';

const messageDiv = document.getElementById('message');

if ( WEBGL.isWebGL2Available() ) {
    messageDiv.style.color = 'green';
    messageDiv.style.fontSize = '24px';
    messageDiv.style.padding = '20px';
    messageDiv.textContent = '✔ WebGL 2 is available in your browser.';
} else {
    const warning = WEBGL.getWebGL2ErrorMessage();
    messageDiv.style.color = 'red';
    messageDiv.style.fontSize = '24px';
    messageDiv.style.padding = '20px';
    messageDiv.textContent = '✘ WebGL 2 is NOT available in your browser. ';
    messageDiv.appendChild(warning);
}