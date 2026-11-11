const {
  validateId,
  validatePaginationAndLimits,
  validateRandomLimit,
  validateSorting,
  validateSearch,
  validateFilters,
  validateNameParam
} = require('../../server/middleware/validator');

const createRes = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return res;
};

const createNext = () => {
  const next = jest.fn();
  return next;
};

const run = (middleware, request) => {
  const res = createRes();
  const next = createNext();
  middleware(request, res, next);
  return { res, next };
};

describe('middleware/validator', () => {
  describe('validateId', () => {
    it.each(['1', '01', '00042', '9007199254740991'])(
      'aceita o ID %p e normaliza para número',
      (id) => {
        const req = { params: { id } };
        const { res, next } = run(validateId, req);
        expect(next).toHaveBeenCalledTimes(1);
        expect(req.validatedId).toBe(Number(id));
        expect(res.statusCode).toBeNull();
      }
    );
    it.each([
      'abc',
      '1abc',
      '1.5',
      '-1',
      '+1',
      '0',
      ' 1',
      '1 ',
      '1e3',
      '9007199254740992'
    ])('rejeita o ID %p com 400', (id) => {
      const req = { params: { id } };
      const { res, next } = run(validateId, req);
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'O ID fornecido é inválido. Deve ser um número inteiro positivo.'
      });
    });

    it('grava o ID validado na requisição', () => {
      const req = { params: { id: '007' } };
      const { res, next } = run(validateId, req);
      expect(next).toHaveBeenCalledTimes(1);
      expect(req.validatedId).toBe(7);
      expect(res.statusCode).toBeNull();
    });
  });

  describe('validatePaginationAndLimits', () => {
    it('aceita ausência dos parâmetros', () => {
      const { res, next } = run(validatePaginationAndLimits, { query: {} });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBeNull();
    });

    it.each(['1', '01', '100'])('aceita limit=%p', (limit) => {
      const { res, next } = run(validatePaginationAndLimits, { query: { limit } });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBeNull();
    });

    it.each([
      ['0', 'O parâmetro \'limit\' deve ser um número inteiro entre 1 e 100.'],
      ['101', 'O parâmetro \'limit\' deve ser um número inteiro entre 1 e 100.'],
      ['1abc', 'O parâmetro \'limit\' deve ser um número inteiro entre 1 e 100.'],
      ['-1', 'O parâmetro \'limit\' deve ser um número inteiro entre 1 e 100.'],
      ['1.5', 'O parâmetro \'limit\' deve ser um número inteiro entre 1 e 100.'],
      ['1e2', 'O parâmetro \'limit\' deve ser um número inteiro entre 1 e 100.']
    ])('rejeita limit=%p', (limit, message) => {
      const { res, next } = run(validatePaginationAndLimits, { query: { limit } });
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ success: false, message });
    });

    it.each(['0', 'abc', '1.5', '-3', '01abc'])('rejeita page=%p', (page) => {
      const { res, next } = run(validatePaginationAndLimits, { query: { page } });
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "O parâmetro 'page' deve ser um número inteiro maior ou igual a 1."
      );
    });

    it('rejeita parâmetros repetidos (arrays)', () => {
      const { res, next } = run(validatePaginationAndLimits, {
        query: { page: ['1', '2'] }
      });
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
    });

    it('valida page e limit independentemente', () => {
      const { res, next } = run(validatePaginationAndLimits, {
        query: { page: '2', limit: '25' }
      });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBeNull();
    });
  });

  describe('validateRandomLimit', () => {
    it('padroniza o limite para 1 quando ausente', () => {
      const req = { query: {} };
      const { res, next } = run(validateRandomLimit, req);
      expect(next).toHaveBeenCalledTimes(1);
      expect(req.validatedRandomLimit).toBe(1);
      expect(res.statusCode).toBeNull();
    });

    it.each(['1', '01', '50'])('aceita limit=%p', (limit) => {
      const req = { query: { limit } };
      const { res, next } = run(validateRandomLimit, req);
      expect(next).toHaveBeenCalledTimes(1);
      expect(req.validatedRandomLimit).toBe(Number(limit));
      expect(res.statusCode).toBeNull();
    });

    it.each(['0', '51', 'abc', '1.5'])('rejeita limit=%p', (limit) => {
      const { res, next } = run(validateRandomLimit, { query: { limit } });
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "O parâmetro 'limit' deve ser um número inteiro entre 1 e 50."
      });
    });
  });

  describe('validateSorting', () => {
    it('aceita ausência dos parâmetros', () => {
      const { res, next } = run(validateSorting, { query: {} });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBeNull();
    });

    it.each(['name', 'id', 'length', 'weight', 'estimatedSpeed', 'status'])(
      'aceita sort=%p',
      (sort) => {
        const { res, next } = run(validateSorting, { query: { sort } });
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBeNull();
      }
    );

    it.each(['year', 'unknown', 'formationId', 'nome'])(
      'rejeita sort=%p',
      (sort) => {
        const { res, next } = run(validateSorting, { query: { sort } });
        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("O parâmetro 'sort' deve ser um dos campos suportados");
      }
    );

    it.each(['asc', 'desc', 'ASC', 'DESC', 'Asc'])(
      'aceita order=%p',
      (order) => {
        const { res, next } = run(validateSorting, { query: { order } });
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBeNull();
      }
    );

    it.each(['up', 'down', 'ascending', ''])('rejeita order=%p', (order) => {
      const { res, next } = run(validateSorting, { query: { order } });
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("O parâmetro 'order' deve ser 'asc' ou 'desc'.");
    });

    it('rejeita sort ou order repetidos', () => {
      const sortRun = run(validateSorting, { query: { sort: ['name', 'id'] } });
      expect(sortRun.next).not.toHaveBeenCalled();
      expect(sortRun.res.statusCode).toBe(400);

      const orderRun = run(validateSorting, { query: { order: ['asc', 'desc'] } });
      expect(orderRun.next).not.toHaveBeenCalled();
      expect(orderRun.res.statusCode).toBe(400);
    });
  });

  describe('validateSearch', () => {
    it('aceita ausência', () => {
      const { res, next } = run(validateSearch, { query: {} });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBeNull();
    });

    it('normaliza espaços nas extremidades', () => {
      const req = { query: { search: '  rex  ' } };
      const { res, next } = run(validateSearch, req);
      expect(next).toHaveBeenCalledTimes(1);
      expect(req.validatedSearch).toBe('rex');
      expect(res.statusCode).toBeNull();
    });

    it('aceita busca vazia', () => {
      const req = { query: { search: '' } };
      const { res, next } = run(validateSearch, req);
      expect(next).toHaveBeenCalledTimes(1);
      expect(req.validatedSearch).toBe('');
    });

    it('rejeita busca com mais de 100 caracteres', () => {
      const { res, next } = run(validateSearch, {
        query: { search: 'a'.repeat(101) }
      });
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "O parâmetro 'search' deve ter no máximo 100 caracteres."
      );
    });

    it('aceita busca com exatamente 100 caracteres', () => {
      const { res, next } = run(validateSearch, {
        query: { search: 'a'.repeat(100) }
      });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBeNull();
    });

    it('rejeita busca repetida (array)', () => {
      const { res, next } = run(validateSearch, {
        query: { search: ['rex', 'trike'] }
      });
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("O parâmetro 'search' deve ser um texto único.");
    });
  });

  describe('validateFilters', () => {
    it('aceita ausência e parâmetros desconhecidos', () => {
      const { res, next } = run(validateFilters, {
        query: { desconhecido: 'abc', outro: '1.5' }
      });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBeNull();
    });

    it.each([
      'periodId',
      'epochId',
      'dietId',
      'continentId',
      'countryId',
      'formationId',
      'familyId',
      'cladeId',
      'habitatId',
      'classificationId',
      'museumId'
    ])('aceita %s como inteiro positivo', (filter) => {
      const { res, next } = run(validateFilters, { query: { [filter]: '01' } });
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBeNull();
    });

    it.each([
      'periodId',
      'formationId',
      'countryId',
      'familyId'
    ])('rejeita %s inválido', (filter) => {
      for (const value of ['abc', '1.5', '-1', '0', '1abc']) {
        const { res, next } = run(validateFilters, { query: { [filter]: value } });
        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
          `O parâmetro '${filter}' deve ser um número inteiro positivo.`
        );
      }
    });

    it.each([
      'lengthMin',
      'lengthMax',
      'weightMin',
      'weightMax',
      'heightMin',
      'heightMax',
      'estimatedSpeedMin',
      'estimatedSpeedMax'
    ])('aceita %s como decimal não negativo', (filter) => {
      for (const value of ['0', '0.5', '12.34', '01.5']) {
        const { res, next } = run(validateFilters, { query: { [filter]: value } });
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBeNull();
      }
    });

    it.each([
      'lengthMin',
      'weightMax',
      'heightMin',
      'estimatedSpeedMax'
    ])('rejeita %s inválido', (filter) => {
      for (const value of ['abc', '-1', '1.5.2', '1,5', '1e3']) {
        const { res, next } = run(validateFilters, { query: { [filter]: value } });
        expect(next).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(
          `O parâmetro '${filter}' deve ser um número maior ou igual a zero.`
        );
      }
    });

    it('rejeita filtros repetidos (arrays)', () => {
      const { res, next } = run(validateFilters, {
        query: { periodId: ['1', '2'] }
      });
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
    });
  });

  describe('validateNameParam', () => {
    it('normaliza o nome', () => {
      const req = { params: { name: '  Rex  ' } };
      const { res, next } = run(validateNameParam, req);
      expect(next).toHaveBeenCalledTimes(1);
      expect(req.validatedName).toBe('Rex');
      expect(res.statusCode).toBeNull();
    });

    it('rejeita nome acima de 100 caracteres', () => {
      const { res, next } = run(validateNameParam, {
        params: { name: 'a'.repeat(101) }
      });
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
    });

    it('rejeita nome não textual', () => {
      const { res, next } = run(validateNameParam, { params: { name: ['a'] } });
      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
    });
  });
});
