const fs = require('fs');
const path = require('path');

// Caminhos para os arquivos JSON
const imagesPath = path.join(__dirname, '../database/images.json');
const dinosPath = path.join(__dirname, '../database/dinosaurs.json');

// Função auxiliar para ler os arquivos
const lerDados = (caminho) => JSON.parse(fs.readFileSync(caminho, 'utf-8'));

exports.getAllImages = (req, res) => {
    try {
        const imagens = lerDados(imagesPath);
        
        res.status(200).json({
            success: true,
            meta: { total: imagens.length },
            data: imagens
        });
    } catch (erro) {
        res.status(500).json({ success: false, message: "Erro interno no servidor ao buscar imagens." });
    }
};

exports.getImagesByDinosaur = (req, res) => {
    try {
        const dinosaurId = Number(req.params.id);
        const dinossauros = lerDados(dinosPath);
        
        const dinossauroExiste = dinossauros.some(d => d.id === dinosaurId);
        
        if (!dinossauroExiste) {
            return res.status(404).json({
                success: false,
                message: "Dinossauro não encontrado."
            });
        }

        const imagens = lerDados(imagesPath);
        const imagensDoDino = imagens.filter(img => img.dinosaurId === dinosaurId);

        res.status(200).json({
            success: true,
            meta: { dinosaurId: dinosaurId, total: imagensDoDino.length },
            data: imagensDoDino
        });

    } catch (erro) {
        res.status(500).json({ success: false, message: "Erro interno no servidor ao buscar imagens do dinossauro." });
    }
};