const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => init(), false);

function init() {
    var overlay = document.getElementById('overlay');
    overlay.remove();

    // Do stuff
    const video = document.getElementById('video');
    video.play();
}