const query = new URLSearchParams(window.location.search);
const url = query.get('mpd') || 'http://localhost:60080/EJERCICIO/sintel.mpd';
const playerElement = document.querySelector('#player');

if (!window.dashjs) {
    console.error('dash.js no está cargado.');
} else {
    const player = window.dashjs.MediaPlayer().create();
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

    // Código requerido por el guion de prácticas:
    // const url = "url_al_manifiesto";
    // const player = dashjs.MediaPlayer().create();
    // player.initialize(document.querySelector("#player"), url, true);
    player.initialize(playerElement, url, true);

    console.log(`Reproduciendo manifiesto DASH: ${url}`);
}
