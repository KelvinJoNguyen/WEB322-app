/**********************************************************************************  
 * WEB322 – Assignment 05  I declare that this assignment is my own work in accordance 
 * with Seneca  Academic Policy.  No part *  of this assignment has been copied 
 * manually or electronically from any other source *  (including 3rd party web sites) 
 * or distributed to other students.* * 
 *  Name: Kelvin Nguyen
 * Student ID: 104087226 
 * Date: July 25, 2023
 * Cyclic Web App URL: https://adventurous-elk-garters.cyclic.app/blog
 * GitHub Repository URL: https://github.com/KelvinJoNguyen/web322-app
 * *********************************************************************************/ 
var express = require("express");
var app = express();
const path = require("path");
const blogService = require("./blog-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")
const exphbs = require("express-handlebars")
const stripJs = require("strip-js");
const blogData = require("./blog-service.js");
const {
  initialize,
  getAllPosts,
  getCategories,
  addPost,
  getPostById,
  getPublishedPostsByCategory,
  getPostsByMinDate,
  addCategory,
  deleteCategoryById,
  deletePostById,
} = require("./blog-service.js");


var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

cloudinary.config({
  cloud_name: 'dvq9jklqp',
  api_key: '252612121878789',
  api_secret: 'tgxQm8AYSE_LpHjLGSnHpirG-c0',
  secure: true
});

const upload = multer();


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
app.use(express.urlencoded({extended: true}));

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
},

formatDate: function(dateObj){
  let year = dateObj.getFullYear();
  let month = (dateObj.getMonth() + 1).toString();
  let day = dateObj.getDate().toString();
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
}

}));

app.set("view engine", ".hbs");
//--------------------------------------------------------------------//


app.get("/", function(req,res){
    res.redirect('/blog');
});

//Route for about
app.get("/about", (req, res) => {
    res.render('about');
  });


//Route for blog
 
app.get("/blog", async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{
      // declare empty array to hold post objects
      let posts = [];

      // if there's a category query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published posts by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published posts
          posts = await blogData.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the posts and post data in the viewData object 
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results 11";
  }

  try{
      // Obtain the full list of categories
      let categories = await blogData.getCategories();

      // store the categories data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results 22"
  }

  // render blog view with viewData
  res.render("blog", {data: viewData})

});

// Route for posts 
app.get("/posts", (req,res) =>{
  
      if (req.query.category) {
        getPublishedPostsByCategory(req.query.category)
        .then((data) => {
          if(data.length > 0){
            res.render("posts", {posts: data});
          }
          else{
            res.render("posts",{ message: "no results 33" });
          }

        })
        .catch((err) => {
          res.render("posts", {message: "no results 44"});

        });
      }
    
      // Checking if a minimum date is provided
      else if (req.query.minDate) {
        getPostsByMinDate(req.query.minDate)
        .then((data) => {
          if(data.length > 0){
            res.render("posts", {posts: data});
          }
          else{
            res.render("posts",{ message: "no results" });
          }
        })
        .catch((err) => {
          res.render("posts", {message: "no results"});
        });
      }
      else{
        getAllPosts()
        .then((data) => {
          if(data.length > 0){
            res.render("posts", {posts: data});
          }
          else{
            res.render("posts",{ message: "no results" });
          }
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
        if(data.length > 0){
          res.render("categories", {categories: data});
        }
        else{
          res.render("categories",{ message: "no results" });
        }
        
    })

      .catch(error => {
        res.render("categories", {message: "no results"});
  });
});


//Add post page route
app.get("/posts/add", (req, res) => {
  getCategories()
    .then((categories) => {
      res.render("addPost", { categories: categories });
    })
    .catch(() => {
      res.render("addPost", { categories: [] });
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
    addPost(postObject).then(() => {
      res.redirect("/posts");
    });
  }
})
// Error Handling
.catch((err) => {
  res.send(err);
});
})

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


 

//Delete category 
app.get("/categories/delete/:id", (req, res) => {
  deleteCategoryById(req.params.id)
  .then(() => {
    res.redirect("/categories");
  })
  .catch(() => {
    console.log("Unable to remove category");
  });
});

//Delete post 
app.get("/posts/delete/:id", (req, res) => {
  deletePostById(req.params.id)
  .then(() => {
    res.redirect("/posts");
  })
  .catch(() => {
    console.log("Unable to remove post");
  });
});

//Get blog by ID
app.get('/blog/:id', async (req, res) => {

  let viewData = {};

  try{

      // declare empty array to hold post objects
      let posts = [];

      // if there's a category query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the posts and post data in the viewData object 
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results 1" ;
  }

  try{
      // Obtain the post by id
      viewData.post = await blogData.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results 2"; 
  }

  try{
      // Obtain the full list of categories
      let categories = await blogData.getCategories();

      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results 3"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});

//Add categories (get)
app.get("/categories/add", (req, res) => {
  res.render("addCategory");
});

//Add categories (post)
app.post("/categories/add", (req, res) => {
  let catObject = {};
  // Add it Category before redirecting to /categories
  catObject.category = req.body.category;
  console.log(req.body.category);
  if (req.body.category != "") {
    addCategory(catObject)
      .then(() => {
        res.redirect("/categories");
      })
      .catch(() => {
        console.log("error occured");
      });
  }
});

// setup http server to listen on HTTP_PORT
blogService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})

//404 requests
app.use((req, res) => {
  res.status(404).render("404");
});
