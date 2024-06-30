/**
 * Default value of registeredObjects option of the Arena class constructor.
 */
export const defaultRegisteredObjects: [any, string][] = [
	// basic objects
	[Symbol, 'Symbol'],
	[Symbol.prototype, 'Symbol.prototype'],
	[Object, 'Object'],
	[Object.prototype, 'Object.prototype'],
	[Function, 'Function'],
	[Function.prototype, 'Function.prototype'],
	[Boolean, 'Boolean'],
	[Boolean.prototype, 'Boolean.prototype'],
	[Array, 'Array'],
	[Array.prototype, 'Array.prototype'],
	// [BigInt, "BigInt"],
	// [BigInt.prototype, "BigInt.prototype"],
	// errors
	[Error, 'Error'],
	[Error.prototype, 'Error.prototype'],
	[EvalError, 'EvalError'],
	[EvalError.prototype, 'EvalError.prototype'],
	[RangeError, 'RangeError'],
	[RangeError.prototype, 'RangeError.prototype'],
	[ReferenceError, 'ReferenceError'],
	[ReferenceError.prototype, 'ReferenceError.prototype'],
	[SyntaxError, 'SyntaxError'],
	[SyntaxError.prototype, 'SyntaxError.prototype'],
	[TypeError, 'TypeError'],
	[TypeError.prototype, 'TypeError.prototype'],
	[URIError, 'URIError'],
	[URIError.prototype, 'URIError.prototype'],
	// built-in symbols
	...Object.getOwnPropertyNames(Symbol)
		.filter(k => typeof (Symbol as any)[k] === 'symbol')
		.map<[any, string]>(k => [(Symbol as any)[k], `Symbol.${k}`]),
]
