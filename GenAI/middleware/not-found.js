const notFound = (req, res) => res.status(404).send('요청하신 URL이 존재하지 않습니다.')

module.exports = notFound
