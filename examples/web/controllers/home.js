const { createHomeView } = require("../views/home");

module.exports.homeController = (request, response) => {
	const homeView = createHomeView(request.accessResponse);
	response.statusCode = 200;
  response.setHeader('Content-Type', 'text/html');
  response.write(homeView);
  response.end();
}
