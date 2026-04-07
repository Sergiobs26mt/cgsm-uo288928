import * as Cesium from "cesium";
import "./style.css";
import "cesium/Build/Cesium/Widgets/widgets.css";
import model_url from "../models/model.gltf";
import trajectory_points from "../data/points.json";

async function main() {
	const viewer = new Cesium.Viewer(document.body, {
		terrain: Cesium.Terrain.fromWorldTerrain()
	});

	const epigPosition = Cesium.Cartesian3.fromDegrees(-5.62384, 43.52442, 350);
	viewer.camera.flyTo({
		destination: epigPosition,
		orientation: {
			heading: Cesium.Math.toRadians(140),
			pitch: Cesium.Math.toRadians(-20)
		},
		duration: 2
	});

	const cameraPosition = Cesium.Cartesian3.fromDegrees(-5.306893049702262, 43.536984468651525, 300);
	setTimeout(() => {
		viewer.camera.flyTo({
			destination: cameraPosition,
			orientation: {
				heading: Cesium.Math.toRadians(120),
				pitch: Cesium.Math.toRadians(-15.0)
			},
			duration: 4
		});
	}, 2500);

	const osmBuildings = await Cesium.createOsmBuildingsAsync();
	viewer.scene.primitives.add(osmBuildings);

	const timeStepInSeconds = 30;
	const totalSeconds = timeStepInSeconds * (trajectory_points.length - 1);
	const start = Cesium.JulianDate.fromIso8601("2025-02-27T17:30:00Z");
	const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());

	viewer.clock.startTime = start.clone();
	viewer.clock.stopTime = stop.clone();
	viewer.clock.currentTime = start.clone();
	viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
	viewer.clock.multiplier = 10;
	viewer.clock.shouldAnimate = true;
	viewer.timeline.zoomTo(start, stop);

	const positionProperty = new Cesium.SampledPositionProperty();

	for (let i = 0; i < trajectory_points.length; i++) {
		const dataPoint = trajectory_points[i];
		const position = Cesium.Cartesian3.fromDegrees(
			dataPoint.longitude,
			dataPoint.latitude,
			dataPoint.height
		);

		viewer.entities.add({
			description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
			position,
			point: {
				pixelSize: 10,
				color: Cesium.Color.RED
			}
		});

		const time = Cesium.JulianDate.addSeconds(start, i * timeStepInSeconds, new Cesium.JulianDate());
		positionProperty.addSample(time, position);
	}

	const modelEntity = viewer.entities.add({
		description: "Drone model",
		position: positionProperty,
		model: {
			uri: model_url,
			minimumPixelSize: 128,
			maximumScale: 2000
		},
		orientation: new Cesium.VelocityOrientationProperty(positionProperty),
		availability: new Cesium.TimeIntervalCollection([
			new Cesium.TimeInterval({
				start,
				stop
			})
		]),
		path: new Cesium.PathGraphics({
			width: 3,
			material: Cesium.Color.YELLOW
		})
	});

	viewer.trackedEntity = modelEntity;
}

main().catch((error) => {
	console.error("Error initialising Cesium scene:", error);
});
