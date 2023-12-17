import { getPrepareOutputHandler } from '../../../src/middleware/prepare-output'

describe('prepareOutput', () => {
  const onError = jest.fn()
  const outputFn = jest.fn()
  const outputFnPromise = jest.fn(() => {
    return Promise.resolve()
  })
  const postProcess = jest.fn()
  const next = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('calls outputFn with default options and no post* middleware', () => {
    const req = {
      method: 'GET',
      erm: {}
    }

    const options = {
      onError,
      outputFn
    }

    getPrepareOutputHandler(options)(req, {}, next)

    expect(outputFn).toHaveBeenCalledTimes(1)
    expect(outputFn).toHaveBeenCalledWith(req, {})
    expect(onError).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('calls outputFn with default options and no post* middleware (async)', async () => {
    const req = {
      method: 'GET',
      erm: {}
    }

    const options = {
      onError,
      outputFn: outputFnPromise
    }

    await getPrepareOutputHandler(options)(req, {}, next)

    expect(outputFnPromise).toHaveBeenCalledTimes(1)
    expect(outputFnPromise).toHaveBeenCalledWith(req, {})
    expect(onError).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('calls postProcess with default options and no post* middleware', () => {
    const req = {
      method: 'GET',
      erm: {}
    }

    const options = {
      onError,
      outputFn,
      postProcess
    }

    getPrepareOutputHandler(options)(req, {}, next)

    expect(outputFn).toHaveBeenCalledTimes(1)
    expect(outputFn).toHaveBeenCalledWith(req, {})
    expect(postProcess).toHaveBeenCalledTimes(1)
    expect(postProcess).toHaveBeenCalledWith(req, {})
    expect(onError).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })

  it('calls postProcess with default options and no post* middleware (async outputFn)', async () => {
    const req = {
      method: 'GET',
      erm: {}
    }

    const options = {
      onError,
      outputFn: outputFnPromise,
      postProcess
    }

    await getPrepareOutputHandler(options)(req, {}, next)

    expect(outputFnPromise).toHaveBeenCalledTimes(1)
    expect(outputFnPromise).toHaveBeenCalledWith(req, {})
    expect(postProcess).toHaveBeenCalledTimes(1)
    expect(postProcess).toHaveBeenCalledWith(req, {})
    expect(onError).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })
})