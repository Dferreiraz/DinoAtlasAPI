const logger = require('../../server/middleware/logger');

describe('middleware/logger', () => {
  let spy;
  let finish;

  const createRes = () => ({
    statusCode: 200,
    on(event, callback) {
      if (event === 'finish') finish = callback;
    }
  });

  beforeEach(() => {
    spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    finish = null;
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('registra método, URL, status, duração e requestId', () => {
    const req = { method: 'GET', originalUrl: '/api/dinosaurs?page=1', id: 'req-1' };
    const res = createRes();
    const next = jest.fn();

    logger(req, res, next);
    res.statusCode = 304;
    finish();

    expect(next).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    const line = spy.mock.calls[0][0];
    expect(line).toContain('GET');
    expect(line).toContain('/api/dinosaurs?page=1');
    expect(line).toContain('304');
    expect(line).toContain('ms');
    expect(line).toContain('requestId=req-1');
  });

  it('usa req.url quando originalUrl não existe', () => {
    const req = { method: 'POST', url: '/x', id: 'req-2' };
    logger(req, createRes(), jest.fn());
    finish();
    expect(spy.mock.calls[0][0]).toContain('POST /x');
  });

  it('usa N/A quando não há requestId', () => {
    const req = { method: 'GET', url: '/x' };
    logger(req, createRes(), jest.fn());
    finish();
    expect(spy.mock.calls[0][0]).toContain('requestId=N/A');
  });
});
