SELECT * FROM categories_on_products;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM categories_on_products;

   DELETE FROM 
       users 
   WHERE 
       (full_name = 'abc' OR full_name = 'defg')
       AND 
       role = 'USER';