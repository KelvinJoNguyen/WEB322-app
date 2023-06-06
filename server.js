var express = require("express");
var app = express();
const path = require('path');
const blogService = require('./blog-service');


var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", function(req,res){
    res.redirect('/about');
});

//Route for about 
app.get("/about", (req, res) => {
    const about = path.join(__dirname, 'views', 'about.html');    
    res.sendFile(about);
  });

//Route for blog
  app.get("/blog", function(req,res){
    blogService.getPublishedPosts()
      .then((filteredPosts)=>{
        const formattedFilterPosts = JSON.stringify(filteredPosts, null, 2);
        res.setHeader("Content-Type", "application/json");
        res.send(formattedFilterPosts);
       
    })

      .catch(error => {
        console.error(error);
        res.status(500).send("Error-Page not found");
      });
});

//Route for posts
app.get("/posts", function(req,res){
    blogService.getAllPosts()
      .then((posts) => {
        const formattedPosts = JSON.stringify(posts, null, 2);
        res.setHeader("Content-Type", "application/json");
        res.send(formattedPosts);
        
    })

      .catch(error => {
        console.error(error);
        res.status(500).send("Error-Page not found");
      });
});

//Route for categories
app.get("/categories", function(req,res){
    blogService.getCategories()
      .then((categories) => {
        const formattedCategories = JSON.stringify(categories, null, 2);
        res.setHeader("Content-Type", "application/json");
        res.send(formattedCategories);
    })

      .catch(error => {
        console.error(error);
        res.status(500).send("Error-Page not found");
  });
});

// setup http server to listen on HTTP_PORT
blogService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})
