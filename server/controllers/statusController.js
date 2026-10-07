exports.getStatus = (req, res) => {
    res.json({
        success: true,
        data: {
            status: "online",
            version: "2.3.0",
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }
    });
};