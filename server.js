const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const session = require("express-session");

const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./users/UsersController");

const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./users/User");

//Setando a view engine para EJS
app.set("view engine", "ejs");

//Setando o body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Setando arquivos statics
app.use(express.static("public"));

//Config sessoes

app.use(
  session({
    secret: "qualquercoisa",
    cookie: { maxAge: 30000 },
  })
);

app.get("/session", (req, res) => {});

app.get("/leitura", (req, res) => {});
//Conectando ao db

connection
  .authenticate()
  .then(() => {
    console.log("Database is running on 8080...");
  })
  .catch(() => {
    console.log("Database isn't running on application ...");
  });

app.get("/", (req, res) => {
  Article.findAll({
    order: [["id", "DESC"]],
    limit: 4,
  }).then((articles) => {
    Category.findAll().then((categories) => {
      res.render("index.ejs", { articles: articles, categories: categories });
    });
  });
});

app.get("/:slug", (req, res) => {
  let slug = req.params.slug;
  Article.findOne({
    where: {
      slug: slug,
    },
  })
    .then((article) => {
      if (article !== undefined) {
        Category.findAll().then((categories) => {
          res.render("article", { article: article, categories: categories });
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((err) => {
      res.redirect("/");
    });
});

app.get("/category/:slug", (req, res) => {
  let slug = req.params.slug;

  Category.findOne({
    where: { slug: slug },
    include: [{ model: Article }],
  })
    .then((category) => {
      if (category !== undefined) {
        Category.findAll().then((categories) => {
          res.render("index", {
            articles: category.articles,
            categories: categories,
          });
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((err) => {
      res.redirect("/");
    });
});

// Definindo controller de categorias
app.use("/", categoriesController);

// Definindo controller de artigos
app.use("/", articlesController);

// Definindo controller de artigos
app.use("/", usersController);
//Conexao localhost
app.listen(8080, () => {
  console.log("Server is running on 8080...");
});
