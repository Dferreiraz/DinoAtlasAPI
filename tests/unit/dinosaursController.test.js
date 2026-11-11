const controller = require('../../server/controllers/dinosaursController');

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('controllers/dinosaursController (caminhos defensivos)', () => {
  it('retorna 400 para limit inválido quando não há validatedRandomLimit', async () => {
    const req = { query: { limit: '0' } };
    const res = createResponse();

    await controller.getRandomDinosaurs(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "O parâmetro 'limit' deve ser um número inteiro entre 1 e 50."
    });
  });

  it('usa Number(req.params.id) quando o middleware não define validatedId', async () => {
    const req = { params: { id: '1' } };
    const res = createResponse();

    await controller.getDinosaurById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.id).toBe(1);
  });

  it('usa req.params.name quando o middleware não define validatedName', async () => {
    const req = { params: { name: 'Tyrannosaurus' } };
    const res = createResponse();

    await controller.getDinosaurByName(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.length).toBeGreaterThan(0);
  });
});
