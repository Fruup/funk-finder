declare module '*&imagetools' {
	declare const url: string
	export default url
}

declare module '$env/static/private' {
	/**
	 * This should come from the build environment.
	 * Coolify does this for example.
	 */
	export const SOURCE_COMMIT: string
}
