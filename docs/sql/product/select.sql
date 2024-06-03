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


SELECT * FROM categories;
SELECT * FROM products;
SELECT * FROM deleted_products;

DELETE FROM categories_on_deleted_products;
DELETE FROM deleted_products;
DELETE FROM categories_on_products;
DELETE FROM categories;
DELETE FROM products;