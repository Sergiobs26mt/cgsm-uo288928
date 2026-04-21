# PL5 - Distribución de medios continuos (Dash.js)

Implementación del apartado **4. Dash.js** de la práctica.

## Archivos principales

- `prac5-1.html` + `src/prac5-1.js`: reproductor DASH básico con `video#player`.
- `prac5-2.html` + `src/prac5-2.js`: copia adaptada de `prac3-2` para usar una textura de vídeo servida por MPEG-DASH.
- `webpack.config.js`: compila las entradas `prac5-1` y `prac5-2` en `dist/`.

## URL del manifiesto

Por defecto se usa:

- `http://localhost:60080/EJERCICIO/sintel.mpd`

Puedes cambiarlo con el query param `mpd`.

Ejemplos:

- `http://localhost:8080/prac5-2.html?mpd=http://localhost:60080/EJERCICIO/sintel.mpd`

## Notas

- Se incluye `dash.all.min.js` local (`v5.1.1`) en `lib/dash.all.min.js` y los HTML lo cargan desde ahí.
- Para que funcione en el cliente de referencia y en navegador, el servidor del manifiesto debe tener CORS habilitado.
