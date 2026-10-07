const readJson = require('../utils/readJson');
const { successResponse, errorResponse } = require('../utils/response');
const { STATUS_CODES } = require('../utils/constants');

// Utils
const filterData = require('../utils/filtering');
const searchData = require('../utils/searching');
const sortData = require('../utils/sorting');
const paginate = require('../utils/pagination');
const path = require('path');
const fs = require('fs');

const DB_PATH = 'server/database/dinosaurs.json';
const IMAGES_PATH = path.join(__dirname, '../database/images.json');

// Função auxiliar para injetar os dados de imagem correspondentes
const injetarImagens = (dinossauros) => {
    try {
        if (!fs.existsSync(IMAGES_PATH)) return dinossauros;
        const images = JSON.parse(fs.readFileSync(IMAGES_PATH, 'utf8'));

        // Se for um array de dinossauros
        if (Array.isArray(dinossauros)) {
            return dinossauros.map(dino => {
                const imgData = images.find(img => img.dinosaurId === dino.id);
                return {
                    ...dino,
                    imagem: imgData ? imgData.image : null,
                    thumbnail: imgData ? imgData.thumbnail : null,
                    imageAuthor: imgData ? imgData.author : null,
                    imageLicense: imgData ? imgData.license : null
                };
            });
        }

      
        const imgData = images.find(img => img.dinosaurId === dinossauros.id);
        return {
            ...dinossauros,
            imagem: imgData ? imgData.image : null,
            thumbnail: imgData ? imgData.thumbnail : null,
            imageAuthor: imgData ? imgData.author : null,
            imageLicense: imgData ? imgData.license : null
        };
    } catch (e) {
        return dinossauros;
    }
};

const getAllDinosaurs = async (req, res) => {
  try {
    let data = await readJson(DB_PATH);
    
    const { search, sort, order, page, limit, ...filters } = req.query;

    data = filterData(data, filters);

    data = searchData(data, search, ['name', 'scientificName', 'description']);

    data = sortData(data, sort, order);

    data = injetarImagens(data);

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
    let dino = data.find(d => d.id === id);

    if (!dino) {
      return res.status(STATUS_CODES.NOT_FOUND).json(
        errorResponse('Dinossauro não encontrado.')
      );
    }

    dino = injetarImagens(dino);

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
    
    let results = data.filter(d => d.name.toLowerCase().includes(nameParam));

    if (results.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json(
        errorResponse('Nenhum dinossauro encontrado com esse nome.')
      );
    }

    results = injetarImagens(results);

    return res.status(STATUS_CODES.OK).json(successResponse(results));
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar o dinossauro pelo nome.', error.message)
    );
  }
};

const getRandomDinosaurs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 1;
    const data = await readJson(DB_PATH);

    if (limit < 1 || limit > 50) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(
        errorResponse("O parâmetro 'limit' deve ser um número entre 1 e 50.")
      );
    }

    const shuffled = [...data].sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, limit);

    selected = injetarImagens(selected);

    return res.status(STATUS_CODES.OK).json(
      successResponse(limit === 1 ? selected[0] : selected, { count: selected.length })
    );
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(
      errorResponse('Erro ao buscar dinossauros aleatórios.', error.message)
    );
  }
};

module.exports = {
  getAllDinosaurs,
  getDinosaurById,
  getDinosaurByName,
  getRandomDinosaurs
};