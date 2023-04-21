import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize the database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQLite database.');

  const sql = `
  CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT
  );`;

  db.run(sql, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Posts table created.');
  });
});

// Routes
app.get('/', (req: Request, res: Response) => {
  db.all('SELECT * FROM posts', (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('index', { posts: rows });
  });
});

app.get('/post/new', (req: Request, res: Response) => {
  res.render('new_post');
});

app.post('/post/new', (req: Request, res: Response) => {
  const { title, content } = req.body;

  const sql = 'INSERT INTO posts (title, content) VALUES (?, ?)';
  db.run(sql, [title, content], (err) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/');
  });
});

app.get('/post/edit/:id', (req: Request, res: Response) => {
  const id = req.params.id;

  const sql = 'SELECT * FROM posts WHERE id = ?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('edit_post', { post: row });
  });
});

app.post('/post/edit/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const { title, content } = req.body;

  const sql = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
  db.run(sql, [title, content, id], (err) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/');
  });
});

app.post('/post/delete/:id', (req: Request, res: Response) => {
  const id = req.params.id;

  const sql = 'DELETE FROM posts WHERE id = ?';
  db.run(sql, [id], (err) => {
    if (err) {
        return console.error(err.message);
      }
      res.redirect('/');
    });
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  

  app.get('/post/:id', (req: Request, res: Response) => {
    const id = req.params.id;
  
    const sql = 'SELECT * FROM posts WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      res.render('post', { post: row });
    });
  });
  