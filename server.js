const express = require('express');
const bodyParser= require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy


const app= express();
const port = 3000;

const saltRounds = 10;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let comments = [
    {id: 1, author: 'jude', text: 'good post'},
    {id: 2, author: 'james', text: 'i enjoyed reading this'},
];

app.get('/comments', (req, res) => {
    res.json(comments);
});

app.post('/comments', (req, res) => {
    const newComment = req.body;
    newComment.id = comments.length + 1;
    comments.push(newComment);
    res.json(newComment);
});

const pages = [
    {id: 1, title: 'Home', url: '/'},
    {id: 2, title: 'Recipes', url: '/recipes.html'},
]
app.get('/pages', (req, res) => {
    res.json(pages);
});

app.get('/search', (req, res) => {
    const searchQuery = req.query.q;
    console.log('Received search request. Query:', searchQuery);

    const searchResults = pages.filter(page =>
        page.title && page.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
        );

        console.log('Search results:', searchResults);

        res.json(searchResults);
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'mychefuser',
    password: 'Oreoluwa@1998',
    database: 'mychefweb'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    }else {
        console.log('Connected to MySQL database');
    }
});

app.use(express.json());
app.post('/register', async (req, res) => {
    try {
    console.log('Request body:', req.body);
    const {username, password, email} = req.body;
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Email', email);
    // const hashedPassword = '$2b$10$OlVBSZcRjQHczq4mmm7Nuu/2Tn9t/jpMPT2oGrzdxA3tsYE/FCxyS';
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Hashed Password:', hashedPassword)

    db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email], (err, result) => {
    // db.query(
    //     [username, hashedPassword, email],
    //     (err, result) => {    
    if (err) {
            console.error('Error registering user:', err);
            res.status(500).json({error: 'Internal Server Error'});
        } else {
            res.status(200).json({success: true, message: 'Thanks for registering!'});
        }
        });

} catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    try {

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results)=> {
        if (err) {
            console.error('Error during login:', err);
            res.status(500).json({ error: 'Internal Server Error'});
        } else if (results.length > 0) {
            const user = results[0];

            if (await bcrypt.compare(password, user.password)) {
                res.status(200).json({success: true, message: 'Login successful'});
            } else {
                res.status(401).json({success: false, message: 'Invalid credentials'});
            }
            } else {
                res.status(401).json({success: false, message: 'Invalid credentials'});
            }
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({arror: 'Internal Server Error'});
    }
   });

   app.get('/profile.html', (req, res) => {
    res.send('Welcome');
   });

   app.use(session({
    secret: 'dora@1998',
    resave: false,
    saveUninitialized: false
   }));

   app.use(passport.initialize());
   app.use(passport.session());

//    app.get('/user-posts', isAuthenticated, (req, res) => {
//     const userId = req.user.id;

//     const query = 'SELECT * FROM posts WHERE userId = ?';

//     db.query(query, [userId], (err, results) => {
//         if (err) {
//             console.error('Error fetching user posts:', err);
//             res.status(500).json({error: 'Internal Server Error'});
//         } else {
//             res.status(200).json(results);
//         }
//     });
//    });
//    function isAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/login')
//    }

const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const isAuthenticated = require('./auth');

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({username});
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Incorrect password.'});
            }
        } catch (error) {
            return done(error);
        }
        }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
try {
    const user = await User.findById(id);
    done(null, user);
} catch (error) {
    done(error);
}
});

app.post('/login',
passport.authenticate('local', {
    successRedirect: '/protected-route',
    failureRedirect: '/login',
    failureFlash: true
})
);

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.post('/create-post', upload.single('postImage'), (req, res) => {
    const userId = req.isAuthenticated() ? req.user.id : null;
    const postContent = req.body.postContent;
    const postImage = req.file.filename;

    const query = 'INSERT INTO posts (userId, content, imageUrl) VALUES (?, ?, ?)';
    db.query(query, [userId, postContent, postImage], (err, results) => {
        if (err) {
            console.error('Error creating post:', err);
            res.status(500).json({error: 'Internal Server Error'});
        } else {
            res.status(200).json({success: true, message: 'Post created successfully'});
        }    
    });
});

app.use(express.static(path.join(__dirname, 'uploads')));

app.get('/user-posts', (req, res) => {
    const userId = req.isAuthenticated() ? req.user.id : null;

    const query = 'SELECT * FROM posts WHERE userId = ? OR userId is NULL';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user posts:', err);
            res.status(500).json({error: 'Internal Server Error'});
        } else {
            res.status(200).json(results);
        }
        });

    });

app.get('/protected-route', isAuthenticated, (req, res) => {
    res.send('Protected Route');
});

app.post('/edit-post/:postId', (req, res) => {
    const postId = req.params.postId;
    const newContent = req.body.newContent;

    const query = 'UPDATE posts SET content = ? WHERE id = ?';
    db.query(query, [newContent, postId], (err, results) => {
        if (err) {
            console.error('Error updating post:', err);
            res.status(500).json({error: 'Internal Server Error'});
        } else {
            res.status(200).json({success: true, message: 'Post updated succesfully'});
        }
    });
});

app.delete('/delete-post/:postId', (req, res) => {
    const postId = req.params.postId;

    const query = 'DELETE FROM posts WHERE id = ?';
    db.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Error deleting post:', err);
            res.status(500).json({error: 'Internal Server Error'});
        } else {
            res.status(200).json({success: true, message: 'Post deleted succesfully'});
        }
    });
});
app.use(express.static(path.join(__dirname, 'uploads')));
app.get('/blog-posts', (req, res) => {
    const query = 'SELECT * FROM posts ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching blog posts:', err);
            res.status(500).json({error: 'Internal Server Error'});
        } else {
            res.status(200).json(results);
        }
    });
});

app.post('/add-comment/:postId', (req, res) => {
    const postId = req.params.postId;
    const userId = req.user?.id;
    const {content} = req.body;

    const getUsernameQuery = 'SELECT username FROM users WHERE id = ?';
    db.query(getUsernameQuery, [userId], (err, usernameResults) => {
        if (err) {
            console.error('Error fetching username:', err);
        } else {
            const username = usernameResults[0]?.username || 'Anonymous';
    

    const insertCommentquery = 'INSERT INTO comments (postId, userId, username, content) VALUES (?, ?, ?, ?)';
    db.query(insertCommentquery, [postId, userId, username, content], (err, results) => {
        if (err) {
            console.error('Error adding comment:', err);
            res.status(500).json({error: 'Internal Server Error'});
        } else {
            res.status(200).json({success: true, message: 'Comment added successfully'});
        }
    });
}
});
});

app.get('/post-comments/:postId', (req, res) => {
    const postId = req.params.postId;

    const query = `
        SELECT comments.*, users.username
        FROM comments
        LEFT JOIN users ON comments.userId = users.id
        WHERE comments.postId = ?
        `;
    db.query(query, [postId], (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            res.status(500).json({error: 'Internal Server Error'});
        } else {
            res.status(200).json(results);
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.listen(port, () => {
    console.log('Server is running at http://localhost:${port}');
});