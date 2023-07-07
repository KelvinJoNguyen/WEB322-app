/**********************************************************************************  
 * WEB322 – Assignment 04  I declare that this assignment is my own work in accordance 
 * with Seneca  Academic Policy.  No part *  of this assignment has been copied 
 * manually or electronically from any other source *  (including 3rd party web sites) 
 * or distributed to other students.* * 
 *  Name: Kelvin Nguyen
 * Student ID: 104087226 
 * Date: July 7, 2023
 * Cyclic Web App URL: https://odd-cyan-lion-hat.cyclic.app/about 
 * GitHub Repository URL: https://github.com/KelvinJoNguyen/web322-app
 * *********************************************************************************/ 
var express = require("express");
var app = express();
const path = require('path');
const blogService = require('./blog-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require('express-handlebars')
const stripJs = require('strip-js');
const blogData = require("./blog-service.js");
const {
  initialize,
  getAllPosts,
  getCategories,
  addPost,
  getPostById,
  getPostsByCategory,
  getPostsByMinDate,
} = require("./blog-service.js");

const upload = multer();

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

cloudinary.config({
  cloud_name: 'dvq9jklqp',
  api_key: '252612121878789',
  api_secret: 'tgxQm8AYSE_LpHjLGSnHpirG-c0',
  secure: true
});


// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// add the property "activeRoute" to "app.locals" whenever the route changes
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

//Custom helpers ----------------------------------------------------//
app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  helpers: { 

navLink: function(url, options){
  return '<li' + 
      ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
      '><a href="' + url + '">' + options.fn(this) + '</a></li>';
},

equal: function(lvalue, rvalue, options) {
  if (arguments.length < 3)
      throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue != rvalue) {
      return options.inverse(this);
  } else {
      return options.fn(this);
  }
},

safeHTML: function(context){
  return stripJs(context);
  }
}

}));
//--------------------------------------------------------------------//


app.get("/", function(req,res){
    res.redirect('/blog');
});

//Route for about
app.get("/about", (req, res) => {
    res.render('about');
  });


//Route for blog

app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results 1";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results 2"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});

// Route for posts - returns formatted json string of all posts 
app.get("/posts", (req,res) =>{
  
      if (req.query.category) {
        getPostsByCategory(req.query.category)
        .then((data) => {
          res.render("posts", {posts: data});
        })
        .catch((err) => {
          res.render("posts", {message: "no results"});

        });
      }
    
      // Checking if a minimum date is provided
      else if (req.query.minDate) {
        getPostsByMinDate(req.query.minDate)
        .then((data) => {
          res.render("posts", {posts: data});
        })
        .catch((err) => {
          res.render("posts", {message: "no results"});
        });
      }
      else{
        getAllPosts()
        .then((data) => {
          res.render("posts", {posts: data});

      })
        .catch(error => {
          res.render("posts", {message: "no results"});
        });
      }
    
});


//Route for categories - returns formatted json string of all categories 
// If error occurs, error is console logged and error message is displayed 
app.get("/categories", (req,res) =>{
    getCategories()
      .then((data) => {
        res.render("categories", {categories: data});
    })

      .catch(error => {
        res.render("categories", {message: "no results"});
  });
});



//Route to add posts - uploads image to hosting website and calls add post function to add new postData
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
let streamUpload = (req) => {
return new Promise((resolve, reject) => {
  let stream = cloudinary.uploader.upload_stream((error, result) => {
    if (result) {
      resolve(result);
    } else {
      reject(error);
    }
  });

  streamifier.createReadStream(req.file.buffer).pipe(stream);
});
};

async function upload(req) {
let result = await streamUpload(req);
console.log(result);
return result;
}

upload(req).then((uploaded) => {
  req.body.featureImage = uploaded.url;
  let postObject = {};

  // Add it Blog Post before redirecting to /posts
  postObject.body = req.body.body;
  postObject.title = req.body.title;
  postObject.postDate = Date.now();
  postObject.category = req.body.category;
  postObject.featureImage = req.body.featureImage;
  postObject.published = req.body.published;

  if (postObject.title) {
    addPost(postObject);
  }
  res.redirect("/posts");
  }).catch((err) => {
    res.send(err);
  });
});

//Get post by value
app.get("/post/value", (req, res) => {
  getPostById(req.params.value)
  .then((data) => {
    res.send(data);
  })
  // Error Handling
  .catch((err) => {
    res.send(err);
  });
})

//Get blog by ID
app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blogData.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});

//404 requests
app.use((req, res) => {
  res.status(404).render("404");
});

//Setup engine
// app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");


// setup http server to listen on HTTP_PORT
blogService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})
