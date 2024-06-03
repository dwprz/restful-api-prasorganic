INSERT INTO 
    products (product_name, image, price, stock, description, created_at, updated_at)
VALUES 
  219  ('KURMA ORGANIK', 'IMAGE TEST', 10000, 250, 'DESCRIPTION TEST 1', NOW(), NOW()),
   220 ('APEL MALANG', 'IMAGE TEST', 20000, 300, 'DESCRIPTION TEST 2', NOW(), NOW()),
   221 ('JERUK BANYUMAS', 'IMAGE TEST', 15000, 200, 'DESCRIPTION TEST 3', NOW(), NOW()),
   222 ('APEL MERAH', 'IMAGE TEST', 18000, 400, 'DESCRIPTION TEST 4', NOW(), NOW()),
   223 ('APEL HIJAU', 'IMAGE TEST', 12000, 350, 'DESCRIPTION TEST 5', NOW(), NOW()),
   224 ('JERUK BALI', 'IMAGE TEST', 22000, 280, 'DESCRIPTION TEST 6', NOW(), NOW()),
   225 ('ANGGUR HIJAU', 'IMAGE TEST', 13000, 320, 'DESCRIPTION TEST 7', NOW(), NOW()),
   226 ('JERUK MANDARIN', 'IMAGE TEST', 16000, 270, 'DESCRIPTION TEST 8', NOW(), NOW()),
   227 ('BERAS KEBUMEN', 'IMAGE TEST', 19000, 380, 'DESCRIPTION TEST 9', NOW(), NOW()),
   228 ('KANGKUNG', 'IMAGE TEST', 21000, 230, 'DESCRIPTION TEST 10', NOW(), NOW()),
   229 ('beras organik', 'IMAGE TEST', 14000, 260, 'DESCRIPTION TEST 11', NOW(), NOW()),
   230 ('apel sragen', 'IMAGE TEST', 17000, 290, 'DESCRIPTION TEST 12', NOW(), NOW()),
   231 ('duwet', 'IMAGE TEST', 23000, 310, 'DESCRIPTION TEST 13', NOW(), NOW()),
   232 ('stawbery', 'IMAGE TEST', 25000, 180, 'DESCRIPTION TEST 14', NOW(), NOW()),
   233 ('strawbery malang', 'IMAGE TEST', 27000, 330, 'DESCRIPTION TEST 15', NOW(), NOW()),
   234 ('alpukat', 'IMAGE TEST', 28000, 270, 'DESCRIPTION TEST 16', NOW(), NOW()),
   235 ('semangka', 'IMAGE TEST', 29000, 320, 'DESCRIPTION TEST 17', NOW(), NOW()),
   236 ('alpukat bandung', 'IMAGE TEST', 30000, 260, 'DESCRIPTION TEST 18', NOW(), NOW()),
   237 ('kacang tanah', 'IMAGE TEST', 31000, 290, 'DESCRIPTION TEST 19', NOW(), NOW()),
   238 ('kacang hijau', 'IMAGE TEST', 32000, 310, 'DESCRIPTION TEST 20', NOW(), NOW()),
   239 ('wortel', 'IMAGE TEST', 33000, 280, 'DESCRIPTION TEST 21', NOW(), NOW());


SELECT * FROM products; # product id = 219-239

INSERT INTO 
    categories (category_name)
VALUES
    ('GRAIN'),591
    ('KURMA'),592
    ('ORGANIK'),593
    ('BERKUALITAS'), 594
    ('FRUIT'),595
    ('BUAH'),596
    ('APEL'),597
    ('VEGETABLE'),598
    ('SAYURAN'),599
    ('SELEDRI'),600
    ('BUAH BUAHAN'),601
    ('LOKAL'),602
    ('MANGGA'),603
    ('STRAWBERY'),604
    ('APEL MERAH'),605
    ('APEL HIJAU'),606
    ('BERAS'),607
    ('BERAS KETAN'),608
    ('BERAS MERAH');609

SELECT * FROM categories; # category id 591-609

INSERT INTO
    categories_on_products (product_id, category_id)
VALUES
    (219, 595),
    (219, 596),
    (219, 592),
    (219, 593),
    (220, 595),
    (220, 596),
    (220, 597),
    (220, 601),
    (221, 596),
    (221, 597),
    (221, 611),
    (221, 612),
    (222, 595),
    (222, 596),
    (222, 597),
    (222, 605),
    (223, 595),
    (223, 596),
    (223, 597),
    (223, 602),
    (223, 606),
    (224, 596),
    (224, 597),
    (224, 611),
    (225, 596),
    (225, 597),
    (225, 615),
    (226, 596),
    (226, 597),
    (226, 611),
    (226, 616),
    (227, 591),
    (227, 607),
    (227, 618),
    (229, 591),
    (229, 593),
    (229, 607);