export default `
const RequestClass = typeof Request !== 'undefined' ? Request : class Request {};
globalThis.Request = RequestClass;
export default RequestClass;
`
