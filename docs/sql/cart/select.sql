SELECT 
          p.product_name, p.image, p.rate, p.sold, p.price, p.stock, p.description, c.*
      FROM 
          products AS p 
      INNER JOIN 
          carts AS c ON c.product_id = p.product_id 
      WHERE 
          c.user_id = 1;