export default `
const ResponseClass = typeof Response !== 'undefined' ? Response : class Response {};
globalThis.Response = ResponseClass;
export default ResponseClass;
`
