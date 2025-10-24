import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { ParameterMetadata } from "../types.ts";

/**
 * Parameter decorator that marks a parameter as a form field for
 * application/x-www-form-urlencoded requests.
 *
 * Must be used with @FormUrlEncoded() decorator on the method.
 *
 * @param key - The field name in the form data
 *
 * @example
 * ```ts
 * class AuthRepository extends Restify {
 *   @POST("/login")
 *   @FormUrlEncoded()
 *   login(
 *     @Field("email") email: string,
 *     @Field("password") password: string
 *   ): Promise<RestifyResponse<AuthToken>> {
 *     return {} as Promise<RestifyResponse<AuthToken>>;
 *   }
 *
 *   // OAuth2 token request
 *   @POST("/oauth/token")
 *   @FormUrlEncoded()
 *   getToken(
 *     @Field("grant_type") grantType: string,
 *     @Field("client_id") clientId: string,
 *     @Field("client_secret") clientSecret: string
 *   ) {}
 * }
 * ```
 */
export function Field(key: string): ParameterDecorator {
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
			type: "field",
			key,
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
