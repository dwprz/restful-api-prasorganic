BEGIN TRANSACTION;

INSERT INTO products(name, image, price, stock, description)
VALUES(${name}, ${image}, ${price}, ${stock}, ${description});

INSERT INTO categories(name) VALUES(${value})
ON CONFLICT(name) DO NOTHING;

 INSERT INTO categories_on_products(product_id, category_id, category_name)
      VALUES(
        (SELECT id FROM products WHERE name = ${name} LIMIT 1),
        (SELECT id FROM categories WHERE name = ${category} LIMIT 1),
        (${category})
      );

COMMIT TRANSACTION;