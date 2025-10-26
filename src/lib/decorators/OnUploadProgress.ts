import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { ParameterMetadata } from "../types.ts";

/**
 * Parameter decorator that marks a parameter to receive upload progress callbacks.
 * Perfect for React state updates during file uploads.
 *
 * @returns A parameter decorator function
 *
 * @example
 * ```ts
 * class FileAPI extends Restify {
 *   @POST('/upload')
 *   async uploadFile(
 *     @Body() file: FormData,
 *     @OnUploadProgress() onProgress?: (progress: number) => void
 *   ) {}
 * }
 *
 * // React usage:
 * function FileUploader() {
 *   const [progress, setProgress] = useState(0);
 *
 *   const handleUpload = async (file: File) => {
 *     const formData = new FormData();
 *     formData.append('file', file);
 *
 *     await api.uploadFile(formData, (progress) => {
 *       setProgress(progress); // 0-100
 *     });
 *   };
 *
 *   return <progress value={progress} max="100" />;
 * }
 * ```
 */
export function OnUploadProgress(): ParameterDecorator {
	return (
		target: object,
		propertyKey: string | symbol | undefined,
		parameterIndex: number,
	) => {
		if (!propertyKey) return;
		const existingParameters: ParameterMetadata[] =
			(Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				target,
				propertyKey,
			) as ParameterMetadata[]) || [];

		const newParameter: ParameterMetadata = {
			index: parameterIndex,
			type: "uploadProgress",
		};

		existingParameters.push(newParameter);
		Reflect.defineMetadata(
			METADATA_KEYS.PARAMETERS,
			existingParameters,
			target,
			propertyKey,
		);
	};
}
