const express = require("express");
const knex = require("knex");

let db;
if (process.env.DATABASE_URL){
    db = knex({
        client: "pg",
        connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        }

    });
}else{
    db = knex({
        client: "pg",
        connection: {
            host: "127.0.0.1",
            user: "postgres",
            password: "admin",
            database: "todo_list"
        }
    });
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    next();
});
app.set("views engine", "ejs");

app.use(express.static("public"));

// res.render
app.get("/", (req, res) => {
    db.select("*")
        .from("todo")
        .then(data => {
            res.render("index.ejs", { todos: data });
        })
        .catch(err => res.status(400).json(err));
});

// create new task
app.post("/addTask", (req, res) => {
    const { textTodo } = req.body;
    db("todo")
        .insert({ task: textTodo })
        .returning("*")
        .then(todo => {
            res.redirect("/");
        })
        .catch(err => {
            res.status(400).json({ message: "unable to create a new task" });
        });
});

app.delete("/deleteTask", (req, res) => {
    const { id } = req.body;
    //let id = req.params.id
    db("todo")
        .where("id", "=", id)
        .delete()
        .returning("*")
        .then(todo => {
            res.json({});
        })
        .catch(err => {
            res.status(400).json({ message: "unable to delete task" });
        });
});

app.put("/moveTaskDone", (req, res) => {
    const { name, id } = req.body;

    if (name === "todo") {
        db("todo")
            .where("id", "=", id)
            .update("status", 1)
            .returning("status")
            .then(task => {res.json(task[0])});
    } else {
        db("todo")
            .where("id", "=", id)
            .update("status", 0)
            .returning("status")
            .then(task => {res.json(task[0])});
    }
});

app.put("/removeTask", (req, res) => {
    const { id } = req.body;


    db("todo")
        .where("id", "=", id)
        .update("status", 3)
        .returning("status")
        .then(task => {res.json(task[0])});
});

app.listen(8080, () => console.log("app is running on port 8080"));

