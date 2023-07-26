const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
var sequelize = new Sequelize('pzodlkbc', 'pzodlkbc', '3SjxW368wXRjpffbku7BiMSdlCx6SPSU', {
    host: 'isilo.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define("Post", {

    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define("Category", {
    category: Sequelize.STRING,
});

Post.belongsTo(Category, {foreignKey: "category"});

//Reads posts and categories json file and adds to array 
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
       sequelize.sync().then(() => {
            resolve();
            console.log("DB Linked")
       }).catch((err) => {
            console.log("Unable to sync to database")
            reject(err)
       })
    })
}

// Returns array of all posts 
module.exports.getAllPosts = () => {
        return new Promise((resolve, reject) => {
            Post.findAll().then((posts) => {
                 console.log("Data found")
                 resolve(posts)
            }).catch((err) => {
                 console.log("No results returned")
                 reject(err)
            })
         })
     
}


module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
        where: {
            published: true,
        },
        })
        .then((data) => {
            resolve(data);
        })
        .catch(() => {
            reject("No results found");
        });
    });
    }

//Returns array of all categories 
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll().then((categories) => {
             console.log("Data found")
             resolve(categories)
        }).catch((err) => {
             console.log("No results returned")
             reject(err)
        })
     })
}


module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
      // Ensure published property is set correctly
      postData.published = postData.published ? true : false;
  
      // Making sure that the empty values are null
      for (const i in postData) {
        if (postData[i] === "") {
          postData[i] = null;
        }
      }
  
      // Setting the date
      postData.postDate = new Date();
  
      // Create a new Post using the postData
      Post.create(postData)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject("Unable to create post");
        });
    });
  }

//Gives array of posts matching category parameter
module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category
              },
            })
              .then((data) => {
                resolve(data)
                console.log("Data found")
              })
              .catch((err) => {
                console.log("No results returned")
                reject(err)
              });
          });
        }

//Gives array of posts matching date 
module.exports.getPostsByMinDate = (minDate) => {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Post.findAll({
        where: {
            postDate: {
                [gte]: new Date(minDateStr)
            }
        }
    })
    .then((data) => {
        resolve(data);
        console.log("Data found")
      })
      .catch((err) => {
        console.log("No results returned")
        reject(err)
      });
  }); 
}
//Gives array of posts matching ID 
module.exports.getPostById = (id) => {
        return new Promise((resolve, reject) => {
            Post.findAll({
              where: {
                id: id,
              },
            })
              .then((data) => {
                resolve(data[0]);
              })
              .catch(() => {
                reject("No results returned");
              });
          });
        }


module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
          where: {
            category: category,
          },
        })
          .then((data) => {
            console.log(category);
            resolve(data);
          })
          .catch(() => {
            reject("No results returned");
          });
      });
    }

//add category 
module.exports.addCategory = (categoryData) => {
  
    return new Promise((resolve, reject) => {
        categoryData.published = (categoryData.published) ? true : false;
        
        for (const i in categoryData) {
            if (categoryData[i] === "") {
                categoryData[i] = null;
            }
          }

          Category.create(categoryData)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject("Unable to create category");
            });
    }); 
}

//delete category by id

module.exports.deleteCategoryById = (categoryId) => {
    return new Promise((resolve, reject) => {
      Category.destroy({
        where: {
          id: categoryId
        }
      }).then(() => {
        console.log("CATEGORY DELETED")
        resolve()
      }).catch((err) => {
        console.log("CATEGORY DELETE FAILED")
        reject(err)
      })
    })
  }

  //delete by post id
  module.exports.deletePostById = (categoryId) => {
    return new Promise((resolve, reject) => {
      Post.destroy({
        where: {
          id: categoryId,
        }
      }).then(() => {
        console.log("POST DELETED")
        resolve()
      }).catch((err) => {
        console.log("POST DELETE FAILED")
        reject(err)
      })
    })
  }


