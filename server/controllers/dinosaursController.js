const jsonRepository = require('../repositories/jsonRepository');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');
const { logError } = require('../utils/errors');

// Utils
const filterData = require('../utils/filtering');
const searchData = require('../utils/searching');
const sortData = require('../utils/sorting');
const paginate = require('../utils/pagination');
const { parseStrictInteger } = require('../utils/validation');
const { attachImages } = require('../utils/dinosaurImages');
const { selectRandomItems } = require('../utils/randomSelection');

const DINOSAURS_FILE = 'dinosaurs.json';

const getAllDinosaurs = async (req, res) => {
  try {
    let data = await jsonRepository.getDatabase(DINOSAURS_FILE);

    const { search, sort, order, page, limit, ...filters } = req.query;

    data = filterData(data, filters);

    const normalizedSearch = req.validatedSearch !== undefined
      ? req.validatedSearch
      : search;
    data = searchData(data, normalizedSearch, ['name', 'scientificName', 'description']);

    data = sortData(data, sort, order);

    // Pagina antes de enriquecer com imagens: apenas os itens retornados
    // precisam da associação, reduzindo o trabalho por requisição.
    const paginated = paginate(data, page, limit);
    const enriched = await attachImages(paginated.data);

    return res.status(STATUS_CODES.OK).json(
      successResponse(enriched, paginated.meta)
    );
  } catch (error) {
    logError('dinosaurs:list', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar dinossauros')
    );
  }
};

const getDinosaurById = async (req, res) => {
  try {
    const id = req.validatedId !== undefined ? req.validatedId : Number(req.params.id);
    let dino = await jsonRepository.getDatabaseById(DINOSAURS_FILE, id);

    if (!dino) {
      return res.status(STATUS_CODES.NOT_FOUND).json(
        errorResponse('Dinossauro não encontrado.')
      );
    }

    dino = await attachImages(dino);

    return res.status(STATUS_CODES.OK).json(successResponse(dino));
  } catch (error) {
    logError('dinosaurs:by-id', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar o dinossauro.')
    );
  }
};

const getDinosaurByName = async (req, res) => {
  try {
    const rawName = req.validatedName !== undefined ? req.validatedName : req.params.name;
    const nameParam = rawName.toLowerCase().trim();
    const data = await jsonRepository.getDatabase(DINOSAURS_FILE);

    let results = data.filter(d => d.name.toLowerCase().includes(nameParam));

    if (results.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json(
        errorResponse('Nenhum dinossauro encontrado com esse nome.')
      );
    }

    results = await attachImages(results);

    return res.status(STATUS_CODES.OK).json(successResponse(results));
  } catch (error) {
    logError('dinosaurs:by-name', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar o dinossauro pelo nome.')
    );
  }
};

const getRandomDinosaurs = async (req, res) => {
  try {
    const requestedLimit = req.query.limit;
    const validatedLimit = req.validatedRandomLimit !== undefined
      ? req.validatedRandomLimit
      : parseStrictInteger(requestedLimit, { min: 1, max: 50 });
    const limit = validatedLimit === null || validatedLimit === undefined ? 1 : validatedLimit;

    if (requestedLimit !== undefined && validatedLimit === null) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse("O parâmetro 'limit' deve ser um número inteiro entre 1 e 50.")
      );
    }

    const data = await jsonRepository.getDatabase(DINOSAURS_FILE);

    let selected = selectRandomItems(data, limit);

    selected = await attachImages(selected);

    return res.status(STATUS_CODES.OK).json(
      successResponse(limit === 1 ? selected[0] : selected, { count: selected.length })
    );
  } catch (error) {
    logError('dinosaurs:random', error, req);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar dinossauros aleatórios.')
    );
  }
};

module.exports = {
  getAllDinosaurs,
  getDinosaurById,
  getDinosaurByName,
  getRandomDinosaurs
};
