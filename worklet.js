import {
  random,
  randomBias,
  seedPRNG,
  createVoronoiDiagram,
} from "@georgedoescode/generative-utils";
import { polygonScale } from "geometric";

// '--avatar-color-1' to '--avatar-color-8'
const colorProps = [...Array(8)]
	.map((_, i) => `--avatar-color-${i + 1}`);

/**
 * CSS Paint API worklet to paint a Voronoi tesselation of random circles and polygons in a given element
 */
class VoronoiAvatar {
	/**
	 * Getter to get a list of all custom properties to pass to the worklet's `paint` function
	 */
	static get inputProperties() {
		return [
			'--avatar-seed',
			...colorProps
		];
	}

	/**
	 * Converts a CSS custom property's value to a trimmed string
	 * @param {any} prop any valid value for a CSS custom property
	 * @returns {string} stringified prop value
	 */
	propToString(prop) {
		return prop.toString().trim();
	}

	/**
	 * Converts a CSS custom property's value to a float
	 * @param {any} prop any valid value for a CSS custom property
	 * @returns {number} prop value parsed as a number
	 */
	propToNumber(prop) {
		return parseFloat(prop);
	}

	/**
	 * Filters a list of possible CSS custom properties down to a list of just properties with values defined
	 * @param {string[]} props names of all possible CSS custom properties to filter down
	 * @returns {string[]} list of CSS custom property names whose values are defined
	 */
	getDefinedColors(props) {
		return colorProps
			.map((key) => this.propToString(props.get(key)))
			.filter(value => value);
	}

	/**
	 * Fills the background-image of the targeted element with a Voronoi tesselation.
	 * Called whenever this element would need to be repainted.
	 * @param {PaintRenderingContext2D} ctx Paint API two-dimensional context, a subset of the Canvas context API
	 * @param {{width: number, height: number}} geometry 
	 * @param {StylePropertyMapReadOnly} props 
	 */
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

/**
 * Paints a polygon with the given points to a given 2D context
 * @param {PaintRenderingContext2D} ctx Paint API two-dimensional context, a subset of the Canvas context API
 * @param {number[][]} points a two-dimensional array of points in a polygon. Accessed like `points[x][y]`.
 */
function polygon(ctx, points) {
	ctx.moveTo(points[0][0], points[0][1]);
	for (let i = 1; i < points.length - 1; i++) {
		ctx.lineTo(points[i][0], points[i][1]);
	}
}

registerPaint('voronoiAvatar', VoronoiAvatar);