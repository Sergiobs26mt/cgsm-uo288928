uniform vec2 uvScale;
varying vec2 vUv;

void main() {
    vUv = uvScale * uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
