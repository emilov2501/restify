import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Method decorator that marks the request as application/x-www-form-urlencoded.
 *
 * When applied, the request body will be encoded as form data instead of JSON.
 * Use with @Field() parameter decorators to specify form fields.
 *
 * @example
 * ```ts
 * class AuthRepository extends Restify {
 *   // Login with form data
 *   @POST("/login")
 *   @FormUrlEncoded()
 *   login(
 *     @Field("email") email: string,
 *     @Field("password") password: string
 *   ) {}
 *   // Sends: email=user%40example.com&password=secret
 *
 *   // OAuth2 token request
 *   @POST("/oauth/token")
 *   @FormUrlEncoded()
 *   getToken(
 *     @Field("grant_type") grantType: "password",
 *     @Field("username") username: string,
 *     @Field("password") password: string,
 *     @Field("client_id") clientId: string
 *   ) {}
 *   // Sends: grant_type=password&username=john&password=secret&client_id=app
 * }
 * ```
 */
export function FormUrlEncoded(): MethodDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		Reflect.defineMetadata(
			METADATA_KEYS.FORM_URL_ENCODED,
			true,
			target,
			propertyKey,
		);
	};
}
