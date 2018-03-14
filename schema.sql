CREATE TABLE users(
  id serial primary key,
  username varchar(32) NOT NULL UNIQUE CHECK (LENGTH(username) >= 3),
  password varchar(255) NOT NULL CHECK (LENGTH(password) >= 6)
);