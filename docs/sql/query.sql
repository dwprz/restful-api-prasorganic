SHOW DATABASES;

USE prasorganic_dummy;

SHOW TABLES;

SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM tags;

DELETE FROM users WHERE username = 'johnd';
DELETE FROM products WHERE id IN(2,3,4,5,6,7,8,9,10);
DELETE FROM products;
DELETE from tags;

UPDATE products SET category = 'vegetables' WHERE id = 2;
UPDATE products SET category = 'grains' WHERE id = 3;