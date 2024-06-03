SELECT * FROM users;

SELECT * FROM admins;

SELECT * FROM products;

SELECT * FROM categories;

SELECT * FROM categories_on_products;

SELECT * FROM carts;

SELECT * FROM orders;

SELECT * FROM products_orders_history;

UPDATE addresses
SET is_main_address = FALSE
WHERE user_id = 1 AND is_main_address = TRUE;
