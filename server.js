var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.redirect('/about')
});

app.get("/about", (req, res) => {
    const yo = req.yo;
    res.send(yo);
  });

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);