// biome-ignore lint/complexity/noBannedTypes: ok here
export function isObject(value: any): value is object | Function {
	return typeof value === 'function' || (typeof value === 'object' && value !== null)
}
