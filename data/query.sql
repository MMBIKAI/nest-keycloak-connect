CREATE TABLE IF NOT EXISTS greeting (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    language TEXT NOT NULL UNIQUE
);

INSERT INTO greeting (message, language) VALUES
  ('Hola el mundo', 'spanish'),
  ('Hello to the world', 'english'),
  ('Salut tout le monde', 'french');
