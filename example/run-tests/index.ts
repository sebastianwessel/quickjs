const code = `
import 'test'

describe('mocha', ()=> {
  it('should work',()=>{
   expect(true).to.be.true
  })
})

const testResult = await runTests();

export default testResult
`
