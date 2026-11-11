const { successResponse, errorResponse } = require('../../server/utils/response');

describe('utils/response', () => {
  describe('successResponse', () => {
    it('monta a resposta de sucesso sem meta', () => {
      const payload = { id: 1 };
      expect(successResponse(payload)).toEqual({
        success: true,
        data: payload
      });
    });

    it('inclui meta quando informado', () => {
      const meta = { page: 1, limit: 10, total: 100, totalPages: 10 };
      expect(successResponse([], meta)).toEqual({
        success: true,
        data: [],
        meta
      });
    });

    it('aceita meta falso/null sem criar a chave', () => {
      expect(successResponse([], null)).not.toHaveProperty('meta');
      expect(successResponse([], false)).not.toHaveProperty('meta');
    });

    it('preserva o objeto de dados sem clonar', () => {
      const data = { id: 1 };
      expect(successResponse(data).data).toBe(data);
    });
  });

  describe('errorResponse', () => {
    it('retorna apenas success e message', () => {
      const payload = errorResponse('Erro seguro.');
      expect(payload).toEqual({
        success: false,
        message: 'Erro seguro.'
      });
      expect(Object.keys(payload)).toEqual(['success', 'message']);
    });

    it('nunca inclui campo error ou detalhes técnicos', () => {
      const payload = errorResponse('Falha.');
      expect(payload).not.toHaveProperty('error');
      expect(payload).not.toHaveProperty('details');
      expect(payload).not.toHaveProperty('stack');
    });

    it('ignora argumentos extras por compatibilidade defensiva', () => {
      const payload = errorResponse('Falha.', 'stack trace secreta');
      expect(payload).toEqual({
        success: false,
        message: 'Falha.'
      });
      expect(JSON.stringify(payload)).not.toContain('stack trace secreta');
    });
  });
});
