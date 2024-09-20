const classRegex = new RegExp(/^class\s/)

export function isES2015Class(cls: any): cls is new (...args: any[]) => any {
	return typeof cls === 'function' && classRegex.test(Function.prototype.toString.call(cls))
}
