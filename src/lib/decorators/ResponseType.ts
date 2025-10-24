import "reflect-metadata";
import type { ResponseType as AxiosResponseType } from "axios";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Method decorator that sets the response type for the HTTP request.
 *
 * This is useful when you need to receive non-JSON responses like files,
 * binary data, or streams.
 *
 * @param type - The response type to use for the request
 *
 * @example
 * ```ts
 * class FileRepository extends Restify {
 *   // Download PDF file
 *   @GET("/files/:id/download")
 *   @ResponseType('blob')
 *   downloadFile(@Path("id") id: number): Promise<RestifyResponse<Blob>> {
 *     return {} as Promise<RestifyResponse<Blob>>;
 *   }
 *
 *   // Get binary data
 *   @GET("/image.jpg")
 *   @ResponseType('arraybuffer')
 *   getImage(): Promise<RestifyResponse<ArrayBuffer>> {
 *     return {} as Promise<RestifyResponse<ArrayBuffer>>;
 *   }
 *
 *   // Get HTML document
 *   @GET("/page")
 *   @ResponseType('document')
 *   getPage(): Promise<RestifyResponse<Document>> {
 *     return {} as Promise<RestifyResponse<Document>>;
 *   }
 *
 *   // Stream data (Node.js only)
 *   @GET("/video/stream")
 *   @ResponseType('stream')
 *   streamVideo() {}
 * }
 * ```
 */
export function ResponseType(type: AxiosResponseType): MethodDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		Reflect.defineMetadata(
			METADATA_KEYS.RESPONSE_TYPE,
			type,
			target,
			propertyKey,
		);
	};
}
