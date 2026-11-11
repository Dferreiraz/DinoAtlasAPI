const { applyImages, attachImages } = require('../../server/utils/dinosaurImages');
const jsonRepository = require('../../server/repositories/jsonRepository');

const index = new Map([
  [1, [{
    image: 'https://example.com/dino.jpg',
    thumbnail: 'https://example.com/dino-thumb.jpg',
    author: 'Autor',
    license: 'CC BY'
  }]]
]);

describe('utils/dinosaurImages', () => {
  it('aplica dados da primeira imagem em uma lista', () => {
    const result = applyImages([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' }
    ], index);

    expect(result[0]).toMatchObject({
      id: 1,
      imagem: 'https://example.com/dino.jpg',
      thumbnail: 'https://example.com/dino-thumb.jpg',
      imageAuthor: 'Autor',
      imageLicense: 'CC BY'
    });
    expect(result[1]).toMatchObject({
      id: 2,
      imagem: null,
      thumbnail: null,
      imageAuthor: null,
      imageLicense: null
    });
  });

  it('aplica dados em um único dinossauro', () => {
    expect(applyImages({ id: 1 }, index)).toMatchObject({
      imagem: 'https://example.com/dino.jpg'
    });
  });

  it('não altera o objeto original', () => {
    const dinosaur = { id: 1 };
    const result = applyImages(dinosaur, index);

    expect(dinosaur).toEqual({ id: 1 });
    expect(result).not.toBe(dinosaur);
  });

  it('usa o índice real do repositório quando nenhum é informado', async () => {
    jsonRepository.clearCache();

    const result = await attachImages([{ id: 1 }]);

    expect(result[0].imagem).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    expect(result[0]).toHaveProperty('imageAuthor');
  });

  it('mantém os dinossauros quando a leitura das imagens falha', async () => {
    const spy = jest.spyOn(jsonRepository, 'getDatabaseGroupedIndex')
      .mockRejectedValueOnce(new Error('falha'));

    const dinosaurs = [{ id: 1 }];

    await expect(attachImages(dinosaurs)).resolves.toBe(dinosaurs);

    spy.mockRestore();
  });
});
