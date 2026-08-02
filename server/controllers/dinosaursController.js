const readJson = require('../utils/readJson');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');

// Utils
const filterData = require('../utils/filtering');
const searchData = require('../utils/searching');
const sortData = require('../utils/sorting');
const paginate = require('../utils/pagination');

const DB_PATH = 'server/database/dinosaurs.json';

const getAllDinosaurs = async (req, res) => {
  try {
    let data = await readJson(DB_PATH);
    
    // Extrai propriedades da query
    const { search, sort, order, page, limit, ...filters } = req.query;

    // 1. Aplica filtros exatos e de mínimo/máximo (periodId, dietId, lengthMin, etc.)
    data = filterData(data, filters);

    // 2. Aplica busca textual nos campos desejados
    data = searchData(data, search, ['name', 'scientificName', 'description']);

    // 3. Aplica ordenação (name, length, weight, yearDiscovered)
    data = sortData(data, sort, order);

    // 4. Aplica paginação
    const paginated = paginate(data, page, limit);

    return res.status(STATUS_CODES.OK).json(
      successResponse(paginated.data, paginated.meta)
    );
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar dinossauros', error.message)
    );
  }
};

const getDinosaurById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await readJson(DB_PATH);
    const dino = data.find(d => d.id === id);

    if (!dino) {
      return res.status(STATUS_CODES.NOT_FOUND).json(
        errorResponse('Dinossauro não encontrado.')
      );
    }

    return res.status(STATUS_CODES.OK).json(successResponse(dino));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar o dinossauro.', error.message)
    );
  }
};

const getDinosaurByName = async (req, res) => {
  try {
    const nameParam = req.params.name.toLowerCase().trim();
    const data = await readJson(DB_PATH);
    
    // Busca ignorando maiúsculas/minúsculas e aceitando partes do nome
    const results = data.filter(d => d.name.toLowerCase().includes(nameParam));

    if (results.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json(
        errorResponse('Nenhum dinossauro encontrado com esse nome.')
      );
    }

    // Retorna array pois pode haver "Tyrannosaurus" e "Tyrannosaurus rex"
    return res.status(STATUS_CODES.OK).json(successResponse(results));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar o dinossauro pelo nome.', error.message)
    );
  }
};

module.exports = {
  getAllDinosaurs,
  getDinosaurById,
  getDinosaurByName
};