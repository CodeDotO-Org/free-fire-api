// const { freeFireApi } = require('./vm');
const { freeFireApi2 } = require('./vm2');
// const { freeFireApi3 } = require('./vm3');

async function topupFreeFire(req, res) {
  try {
    const { package, userId } = req.query;

    const traxId = await freeFireApi2('100067', package, userId);

    console.log(traxId);

    res.status(200).json({ status: 200, traxId });
  } catch (error) {
    res.status(400).json({ status: 400, message: `${error.message}` });
  }
}

module.exports = {
  topupFreeFire,
};
