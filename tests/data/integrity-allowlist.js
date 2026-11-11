/**
 * Exceções explícitas de integridade.
 *
 * Cada entrada só pode ocultar exatamente a violação descrita. O teste de
 * integridade falha se uma entrada deixar de corresponder a uma violação real
 * (entrada obsoleta) ou se surgir qualquer violação não listada aqui.
 *
 * Documentação: docs/data-integrity.md
 */

const ORPHAN_FORMATION_REFERENCES = Object.freeze([
  { dinosaurId: 12, dinosaurName: 'Giganotosaurus', formationId: 7, reason: 'A formação-alvo não existe em formations.json e não há fonte estratigráfica por espécime no repositório para definir o registro correto.' },
  { dinosaurId: 13, dinosaurName: 'Argentinosaurus', formationId: 7, reason: 'A formação-alvo não existe em formations.json; a associação permanece pendente de fonte estratigráfica.' },
  { dinosaurId: 63, dinosaurName: 'Dreadnoughtus', formationId: 7, reason: 'A formação-alvo não existe em formations.json; a associação permanece pendente de fonte estratigráfica.' },
  { dinosaurId: 81, dinosaurName: 'Megaraptor', formationId: 7, reason: 'A formação-alvo não existe em formations.json; a associação permanece pendente de fonte estratigráfica.' },
  { dinosaurId: 89, dinosaurName: 'Patagotitan', formationId: 7, reason: 'A formação-alvo não existe em formations.json; a associação permanece pendente de fonte estratigráfica.' },
  { dinosaurId: 14, dinosaurName: 'Iguanodon', formationId: 8, reason: 'A formação-alvo não existe em formations.json; não foi criada uma formação fictícia.' },
  { dinosaurId: 60, dinosaurName: 'Dacentrurus', formationId: 8, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 68, dinosaurName: 'Eustreptospondylus', formationId: 8, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 74, dinosaurName: 'Hypsilophodon', formationId: 8, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 96, dinosaurName: 'Scelidosaurus', formationId: 8, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 18, dinosaurName: 'Amargasaurus', formationId: 12, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 20, dinosaurName: 'Coelophysis', formationId: 14, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 21, dinosaurName: 'Archaeopteryx', formationId: 15, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 22, dinosaurName: 'Compsognathus', formationId: 15, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 23, dinosaurName: 'Gallimimus', formationId: 16, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 24, dinosaurName: 'Oviraptor', formationId: 16, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 71, dinosaurName: 'Gigantoraptor', formationId: 16, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 99, dinosaurName: 'Tarbosaurus', formationId: 16, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 33, dinosaurName: 'Therizinosaurus', formationId: 19, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 34, dinosaurName: 'Deinocheirus', formationId: 19, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 43, dinosaurName: 'Muttaburrasaurus', formationId: 22, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 78, dinosaurName: 'Leaellynasaura', formationId: 22, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 44, dinosaurName: 'Cryolophosaurus', formationId: 23, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 53, dinosaurName: 'Antarctopelta', formationId: 23, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 45, dinosaurName: 'Microraptor', formationId: 24, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 55, dinosaurName: 'Beipiaosaurus', formationId: 24, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 75, dinosaurName: 'Incisivosaurus', formationId: 24, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 50, dinosaurName: 'Tsintaosaurus', formationId: 27, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' },
  { dinosaurId: 97, dinosaurName: 'Shantungosaurus', formationId: 27, reason: 'A formação-alvo não existe em formations.json; associação mantida como pendência documentada.' }
]);

const FORMATION_PERIOD_MISMATCHES = Object.freeze([
  { dinosaurId: 47, dinosaurName: 'Pentaceratops', formationId: 2, reason: 'Formação Morrison é jurássica e o dinossauro é cretáceo; a formação correta não foi comprovada no repositório.' },
  { dinosaurId: 54, dinosaurName: 'Bambiraptor', formationId: 2, reason: 'Formação Morrison é jurássica e o dinossauro é cretáceo; a formação correta não foi comprovada no repositório.' },
  { dinosaurId: 67, dinosaurName: 'Eoraptor', formationId: 6, reason: 'Formação Anacleto é cretácea e o dinossauro é triássico; a formação correta não foi comprovada no repositório.' },
  { dinosaurId: 73, dinosaurName: 'Herrerasaurus', formationId: 6, reason: 'Formação Anacleto é cretácea e o dinossauro é triássico; a formação correta não foi comprovada no repositório.' },
  { dinosaurId: 79, dinosaurName: 'Lufengosaurus', formationId: 3, reason: 'Formação Djadokhta é cretácea e o dinossauro é jurássico; a formação correta não foi comprovada no repositório.' },
  { dinosaurId: 82, dinosaurName: 'Monolophosaurus', formationId: 3, reason: 'Formação Djadokhta é cretácea e o dinossauro é jurássico; a formação correta não foi comprovada no repositório.' },
  { dinosaurId: 86, dinosaurName: 'Omeisaurus', formationId: 3, reason: 'Formação Djadokhta é cretácea e o dinossauro é jurássico; a formação correta não foi comprovada no repositório.' },
  { dinosaurId: 88, dinosaurName: 'Panphagia', formationId: 6, reason: 'Formação Anacleto é cretácea e o dinossauro é triássico; a formação correta não foi comprovada no repositório.' },
  { dinosaurId: 98, dinosaurName: 'Staurikosaurus', formationId: 25, reason: 'Formação Romualdo é cretácea e o dinossauro é triássico; a formação correta não foi comprovada no repositório.' }
]);

// Semântica adotada: countryId representa o(s) país(es) onde o fóssil foi
// descoberto. Uma formação pode ter país diferente quando o registro agrega
// ocorrências de vários países ou quando a formação ainda não foi corrigida.
const FORMATION_COUNTRY_MISMATCHES = Object.freeze([
  { dinosaurId: 38, dinosaurName: 'Carcharodontosaurus', formationId: 4, countryIds: [12, 13], reason: 'O registro lista Marrocos e Argélia, enquanto a Formação Bahariya está associada ao Egito. A abrangência geográfica não foi alterada sem fonte por espécime.' },
  { dinosaurId: 79, dinosaurName: 'Lufengosaurus', formationId: 3, countryIds: [3], reason: 'A formação associada é mongol e o país do registro é a China; a formação correta permanece pendente.' },
  { dinosaurId: 82, dinosaurName: 'Monolophosaurus', formationId: 3, countryIds: [3], reason: 'A formação associada é mongol e o país do registro é a China; a formação correta permanece pendente.' },
  { dinosaurId: 86, dinosaurName: 'Omeisaurus', formationId: 3, countryIds: [3], reason: 'A formação associada é mongol e o país do registro é a China; a formação correta permanece pendente.' }
]);

const DUPLICATE_FAMILY_NAMES = Object.freeze([
  { name: 'Ceratopsidae', ids: [2, 13], reason: 'ID 2 é legado (sem dinossauros) e ID 13 é canônico; IDs públicos preservados.' },
  { name: 'Stegosauridae', ids: [3, 14], reason: 'ID 3 é legado (sem dinossauros) e ID 14 é canônico; IDs públicos preservados.' },
  { name: 'Brachiosauridae', ids: [4, 12], reason: 'ID 4 é legado (sem dinossauros) e ID 12 é canônico; IDs públicos preservados.' },
  { name: 'Dromaeosauridae', ids: [5, 15], reason: 'ID 5 é legado (sem dinossauros) e ID 15 é canônico; IDs públicos preservados.' },
  { name: 'Spinosauridae', ids: [6, 11], reason: 'ID 6 é legado (sem dinossauros) e ID 11 é canônico; IDs públicos preservados.' },
  { name: 'Allosauridae', ids: [7, 16], reason: 'ID 7 é legado (sem dinossauros) e ID 16 é canônico; IDs públicos preservados.' },
  { name: 'Ankylosauridae', ids: [8, 23], reason: 'ID 8 é legado (sem dinossauros) e ID 23 é canônico; IDs públicos preservados.' },
  { name: 'Diplodocidae', ids: [9, 19], reason: 'ID 9 é legado (sem dinossauros) e ID 19 é canônico; IDs públicos preservados.' },
  { name: 'Hadrosauridae', ids: [10, 21], reason: 'ID 10 é legado (sem dinossauros) e ID 21 é canônico; IDs públicos preservados.' }
]);

// Registros legados mantidos por compatibilidade; não possuem dinossauros associados.
const LEGACY_FAMILY_IDS = Object.freeze([2, 3, 4, 5, 6, 7, 8, 9, 10]);

const canonicalKey = (dinosaurId, formationId) => `dinosaur:${dinosaurId}:formation:${formationId}`;

module.exports = {
  ORPHAN_FORMATION_REFERENCES,
  FORMATION_PERIOD_MISMATCHES,
  FORMATION_COUNTRY_MISMATCHES,
  DUPLICATE_FAMILY_NAMES,
  LEGACY_FAMILY_IDS,
  canonicalKey
};
