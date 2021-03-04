// import { MedHandler, PixelDataHandler } from '@sethealth/core';
// // @ts-ignore
// import { tensor, loadGraphModel, GraphModel, tidy, grad } from '@tensorflow/tfjs';
// import MODEL_CONFIG from '../assets/ml_1/config.json';

// export type NormalizeOptions = NormalizeMinMax;
// export interface NormalizeMinMax {
//   type: 'min-max';
//   min: number;
//   max: number;
// }

// export const getTensor2D = (
//   pixels: PixelDataHandler,
//   slice: number,
//   opts: NormalizeOptions
// ) => {
//   const dims = pixels.dimensions;
//   const area = dims.x * dims.y;
//   const data = new Int16Array(pixels.data, area*slice, area);
//   const buffer = normalize(data, opts);
//   return tensor(buffer, [
//     dims.x,
//     dims.y,
//   ]);
// };

// export const getTensor3D = async (
//   pixels: PixelDataHandler,
//   opts: NormalizeOptions
// ) => {
//   const dims = pixels.dimensions;
//   const buffer = normalize(pixels.data, opts);
//   return tensor(buffer, [
//     dims.x,
//     dims.y,
//     dims.z
//   ]);
// }

// const normalize = (input: Int16Array, opts: NormalizeOptions): Float32Array => {
//   const output = new Float32Array(input.length);
//   const slope = 2*(opts.max - opts.min);
//   const intercept = -1;
//   for (let i = 0; i < input.length; i++) {
//     let v = slope*input[i] + intercept;
//     if (v < -1) {
//       v = -1;
//     } else if (v > 1) {
//       v = 1;
//     }
//     output[i] = v;
//   }
//   return output;
// }

// let MODEL: GraphModel | undefined;
// const getModel = async () => {
//   if (!MODEL) {
//     MODEL = await loadGraphModel("https://public.sethealth.app/ml1/model.json");
//   }
//   return MODEL;
// }

// async function distOverClasses(values: number[]){

//   const topClassesAndProbs = [];
//   let value_normalized = 0;
// 	for (let i = 0; i < values.length; i++) {

// 		if (values[i] < MODEL_CONFIG.OP_POINT[i]){
// 			value_normalized = values[i]/(MODEL_CONFIG.OP_POINT[i]*2);
// 		}else{
// 			value_normalized = 1-((1-values[i])/((1-(MODEL_CONFIG.OP_POINT[i]))*2));
// 			if (((value_normalized > 0.6) as any) & MODEL_CONFIG.SCALE_UPPER){
// 			  value_normalized = Math.min(1, value_normalized*MODEL_CONFIG.SCALE_UPPER);
// 			}
// 		}
// 		console.log(MODEL_CONFIG.LABELS[i] + ",pred:" + values[i] + "," + "OP_POINT:" + MODEL_CONFIG.OP_POINT[i] + "->normalized:" + value_normalized);

// 		topClassesAndProbs.push({
// 			className: MODEL_CONFIG.LABELS[i],
// 			probability: value_normalized
// 		});
// 	}
// 	return topClassesAndProbs
// }

// export const runModel = async (med: MedHandler) => {
//   const model = await getModel();

//   const pixels = await med.volume!.filter([
//     {
//       type: 'resample',
//       width: MODEL_CONFIG.IMAGE_SIZE,
//       height: MODEL_CONFIG.IMAGE_SIZE
//     }
//   ]);
//   const tensor = getTensor2D(pixels, 0, {
//     type: 'min-max',
//     min: 0,
//     max: 255,
//   });
//   const input = tensor.reshape([1, 1, MODEL_CONFIG.IMAGE_SIZE, MODEL_CONFIG.IMAGE_SIZE]);

//   const output = tidy(() => {
//     return model.execute(input, [MODEL_CONFIG.OUTPUT_NODE])
//   });
//   const logits = await (output as any).data();
//   console.log("logits=" + logits)
//   const results = await distOverClasses(logits);
//   const idx = results.findIndex(r =>  r.probability > 0.7);
//   if (idx >= 0) {
//     computeExplanation(input, idx);
//   }
// }

// const computeExplanation = async (input: any, idx: number) => {
//   const model = await getModel();

//   const layer = tidy(() => {

//     const chestgrad = grad(x => ((model.predict(x) as any).reshape([-1]).gather(idx)))
//     const grade = chestgrad(input);

//     const layer = grade.mean(0).abs().max(0)
//     return layer.div(layer.max())
//   });
//   return
// }
