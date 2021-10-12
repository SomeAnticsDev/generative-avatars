import {
  random,
  randomBias,
  seedPRNG,
  createVoronoiDiagram,
} from "@georgedoescode/generative-utils";
import { polygonScale } from "geometric";

// --avatar-color-1 to --avatar-color-8
const colorProps = [...Array(8)]
	.map((_, i) => `--avatar-color-${i + 1}`);

class VoronoiAvatar {
	static get inputProperties() {
		return [
			'--avatar-seed',
			...colorProps
		];
	}

	propToString(prop) {
		return prop.toString().trim();
	}

	propToNumber(prop) {
		return parseFloat(prop);
	}

	getDefinedColors(props) {
		return colorProps
			.map((key) => this.propToString(props.get(key)))
			.filter(value => value);
	}

	paint(ctx, geometry, props) {
		const {width, height} = geometry;
		ctx.fillStyle = 'tomato';
		ctx.fillRect(0, 0, width, height);

		const seed = this.propToString(props.get('--avatar-seed') || 123456);
		const colors = this.getDefinedColors(props);

		console.log({seed, colors})

		seedPRNG(seed);
		const points = [...Array(random(4, 24, true))]
			.map(() => {
				return {
					x: random(0, width),
					y: random(0, height)
				};
			})

		const diagram = createVoronoiDiagram({width, height, points});
		diagram.cells.forEach((cell) => {
			ctx.fillStyle = random(colors);
			ctx.strokeStyle = random(colors);
			if (random(0, 1) > 0.5) {
				ctx.beginPath();
				ctx.arc(
					cell.centroid.x,
					cell.centroid.y,
					cell.innerCircleRadius / 2,
					0,
					Math.PI * 2
				);
				ctx.fill();
			} else {
				ctx.beginPath();
				polygon(ctx, polygonScale(cell.points, 0.85));
				ctx.fill();
			}
		});
	}
}

function polygon(ctx, points) {
	ctx.moveTo(points[0][0], points[0][1]);
	for (let i = 1; i < points.length - 1; i++) {
		ctx.lineTo(points[i][0], points[i][1]);
	}
}

registerPaint('voronoiAvatar', VoronoiAvatar);