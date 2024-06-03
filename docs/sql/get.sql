SELECT p.id, p.name, p.image, p.price, p.stock, p.description, p.rate, p.sold
FROM products AS p
JOIN "categories_on_products" AS cp ON p.id = cp.product_id
JOIN categories AS c ON c.id = cp.category_id
WHERE c.name IN ('beras', 'organik', 'grains')
GROUP BY p.id, p.name
ORDER BY COUNT(cp.product_id) DESC
LIMIT 20 OFFSET 20;

# get products
SELECT p.*
  FROM products AS p JOIN categories_on_products AS cp
  ON( cp.product_id = p.id ) JOIN categories AS c
  ON( c.id = cp.category_id )
  WHERE p.name = ${name} LIMIT 1;

# get categories on product
SELECT c.name
  FROM products AS p
  JOIN categories_on_products AS cp ON(cp.product_id = p.id)
  JOIN categories AS c ON(c.id = cp.category_id)
  WHERE p.name = ${name};

# get total products by category
SELECT COUNT(DISTINCT p.id)
FROM products AS p
JOIN categories_on_products AS cp
ON(p.id = cp.product_id)
JOIN categories AS c
ON(c.id = cp.category_id)
WHERE cp.category_name in( 'beras', 'organik');


