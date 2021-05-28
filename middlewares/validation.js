
module.exports.validateData = async function(req, res, next) {
  req.objects = {};
  if (req.method === "POST") {
    req.objects.data = req.body;
  } else if (req.method === "GET") {
    req.objects.data = req.query;
  } else if (req.method === "PUT") {
    req.objects.id == req.query.id;
    req.objects.data = req.body;
  }
  next();
}