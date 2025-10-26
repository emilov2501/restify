import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { ParameterMetadata } from "../types.ts";

/**
 * Parameter decorator that marks a parameter to receive download progress callbacks.
 * Perfect for React state updates during file downloads.
 *
 * @returns A parameter decorator function
 *
 * @example
 * ```ts
 * class FileAPI extends Restify {
 *   @GET('/download/:id')
 *   async downloadFile(
 *     @Path('id') id: string,
 *     @OnDownloadProgress() onProgress?: (progress: number) => void
 *   ) {}
 * }
 *
 * // React usage:
 * function FileDownloader({ fileId }: { fileId: string }) {
 *   const [progress, setProgress] = useState(0);
 *
 *   const handleDownload = async () => {
 *     await api.downloadFile(fileId, (progress) => {
 *       setProgress(progress); // 0-100
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleDownload}>Download</button>
 *       <progress value={progress} max="100" />
 *     </div>
 *   );
 * }
 * ```
 */
export function OnDownloadProgress(): ParameterDecorator {
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
			type: "downloadProgress",
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
