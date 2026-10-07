const dinosaurs = require('../data/dinosaurs.json');

exports.getStatistics = (req, res) => {
    const stats = {
        totalDinosaurs: dinosaurs.length,
        totalFamilies: new Set(dinosaurs.map(d => d.family)).size,
        totalPeriods: new Set(dinosaurs.map(d => d.period)).size,
        totalContinents: new Set(dinosaurs.map(d => d.continent)).size,
    };

    res.json({
        success: true,
        data: stats
    });
};