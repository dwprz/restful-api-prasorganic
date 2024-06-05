SELECT 
    * 
FROM
    products
WHERE
    product_name = 'a'
LIMIT 1;


SELECT 
    * 
FROM
    products
LIMIT 20 OFFSET 1;

SELECT * FROM products;

SELECT * FROM products ORDER BY RANDOM() LIMIT 20 OFFSET 20;


SELECT 
    p.*
FROM    
    products AS p
INNER JOIN
    categories_on_products AS cop ON cop.product_id = p.product_id
INNER JOIN
    categories AS c ON c.category_id = cop.category_id
WHERE
    c.category_name IN ('APEL')
GROUP BY 
    p.product_id
ORDER BY
    COUNT(p.product_id) DESC;

SELECT
    COUNT(DISTINCT p.product_id)
FROM 
    products AS p
INNER JOIN
    categories_on_products AS cop ON cop.product_id = p.product_id
INNER JOIN
    categories AS c ON c.category_id = cop.category_id
WHERE 
    c.category_name IN ('KURMA', 'ORGANIK');


WITH unique_products AS (
    SELECT 
        product_id
    FROM
        products
    LIMIT 1 OFFSET 0
    )
SELECT 
    c.*, p.product_name, p.image, p.rate, p.sold, p.price, p.stock, p.description,
    u.email, u.photo_profile, u.role  
FROM 
    products AS p
INNER JOIN
    carts AS c ON c.product_id = p.product_id
INNER JOIN 
    users AS u ON u.user_id = c.user_id
WHERE 
    p.product_id IN (SELECT * FROM unique_products);

SELECT * FROM categories;
SELECT * FROM products;
SELECT * FROM deleted_products;

DELETE FROM categories_on_deleted_products;
DELETE FROM deleted_products;
DELETE FROM categories_on_products;
DELETE FROM categories;
DELETE FROM products;