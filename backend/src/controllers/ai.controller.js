const aiService = require("../services/ai.service")

module.exports.getReview = async (req, res) => {
    try {
        const {code,language} = req.body;

        if (!code) {
            return res.status(400).send("Code is required");
        }

        const response = await aiService(code, language);

        res.send(response);

    } catch (error) {
        console.error("AI Controller Error:", error);

        res.status(500).send("Failed to generate code review");
    }
};

