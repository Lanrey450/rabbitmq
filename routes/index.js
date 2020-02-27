/**
 * This file scans through the current directory using each file as a route with the name of the file(without the extension) as the route
 * @param app
 */
module.exports = (app) =>{
    require("fs").readdirSync(__dirname).forEach(function(fileName) {
      const routeName = fileName.split('.')[0];
      if (routeName !== "index")
        app.use(`/${routeName}`,  require("./" + fileName))
    });
  };
  