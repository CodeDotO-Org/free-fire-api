const { freeFireApi } = require('./vm');

async function topupFreeFire(req, res) {
  try {
    const { package, userId } = req.query;

    const traxId = await freeFireApi('100067', package, userId);

    console.log(traxId);

    res.status(200).json({ status: 200, traxId });
  } catch (error) {
    res.status(400).json({ status: 400, message: `${error.message}` });
  }
}

module.exports = {
  topupFreeFire,
};
