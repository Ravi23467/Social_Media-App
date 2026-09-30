const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "social_media"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("MySQL Connected");
    }
});

// Get all posts
app.get("/api/posts", (req, res) => {

    const sql = `
        SELECT 
            posts.id,
            posts.content,
            posts.created_at,
            users.username,
            COUNT(likes.id) AS likes
        FROM posts
        JOIN users ON posts.user_id = users.id
        LEFT JOIN likes ON posts.id = likes.post_id
        GROUP BY posts.id
        ORDER BY posts.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});

// Create user
app.post("/api/users", (req, res) => {

    const { username, email, password, bio } = req.body;

    const sql = `
        INSERT INTO users
        (username, email, password, bio)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [username, email, password, bio],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "User created successfully",
                userId: result.insertId
            });
        }
    );
});

// Create post
app.post("/api/posts", (req, res) => {

    const { user_id, content } = req.body;

    const sql = `
        INSERT INTO posts
        (user_id, content)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [user_id, content],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Post created",
                postId: result.insertId
            });
        }
    );
});

// Like a post
app.post("/api/posts/:id/like", (req, res) => {

    const postId = req.params.id;
    const userId = req.body.user_id;

    const sql = `
        INSERT INTO likes
        (post_id, user_id)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [postId, userId],
        (err) => {

            if (err) {
                return res.status(400).json({
                    error: "Already liked or invalid request"
                });
            }

            res.json({
                message: "Post liked"
            });
        }
    );
});

// Add comment
app.post("/api/posts/:id/comments", (req, res) => {

    const postId = req.params.id;
    const { user_id, comment } = req.body;

    const sql = `
        INSERT INTO comments
        (post_id, user_id, comment)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [postId, user_id, comment],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Comment added",
                commentId: result.insertId
            });
        }
    );
});

// Follow user
app.post("/api/users/:id/follow", (req, res) => {

    const followingId = req.params.id;
    const followerId = req.body.follower_id;

    const sql = `
        INSERT INTO followers
        (follower_id, following_id)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [followerId, followingId],
        (err) => {

            if (err) {
                return res.status(400).json({
                    error: "Already following"
                });
            }

            res.json({
                message: "User followed"
            });
        }
    );
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});