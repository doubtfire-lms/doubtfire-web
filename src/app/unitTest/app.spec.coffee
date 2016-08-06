app = require('../app')

describe 'Basic unit test', ->
  adder = (x, y) ->
    return x + y
  it 'should add two numbers together', ->
    result = adder 2, 3
    expect(result).toBe 5
