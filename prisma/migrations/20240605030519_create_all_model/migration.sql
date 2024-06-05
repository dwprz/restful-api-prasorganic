-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "photo_profile" VARCHAR(500),
    "whatsapp" VARCHAR(20),
    "refresh_token" VARCHAR(1000),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "otp" (
    "email" VARCHAR(100) NOT NULL,
    "otp" VARCHAR(6) NOT NULL,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" SERIAL NOT NULL,
    "product_name" VARCHAR(100) NOT NULL,
    "image" VARCHAR(300) NOT NULL,
    "rate" INTEGER,
    "sold" INTEGER,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "description" TEXT,
    "is_top_product" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "deleted_products" (
    "product_id" INTEGER NOT NULL,
    "product_name" VARCHAR(100) NOT NULL,
    "image" VARCHAR(300) NOT NULL,
    "rate" INTEGER,
    "sold" INTEGER,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "description" TEXT,
    "is_top_product" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "deleted_products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" VARCHAR(20) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "categories_on_products" (
    "product_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "categories_on_products_pkey" PRIMARY KEY ("product_id","category_id")
);

-- CreateTable
CREATE TABLE "categories_on_deleted_products" (
    "product_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "categories_on_deleted_products_pkey" PRIMARY KEY ("product_id","category_id")
);

-- CreateTable
CREATE TABLE "carts" (
    "cart_item_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("cart_item_id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "address_id" SERIAL NOT NULL,
    "address_owner" VARCHAR(100) NOT NULL,
    "street" VARCHAR(200) NOT NULL,
    "subdistrict" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "country" VARCHAR(50),
    "postal_code" VARCHAR(10) NOT NULL,
    "whatsapp" VARCHAR(20) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_main_address" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "orders" (
    "order_id" SERIAL NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "logistic" VARCHAR(50) NOT NULL,
    "payment_method" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "address_owner" VARCHAR(100) NOT NULL,
    "street" VARCHAR(200) NOT NULL,
    "subdistrict" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "country" VARCHAR(50),
    "postal_code" VARCHAR(10) NOT NULL,
    "whatsapp" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "products_orders" (
    "product_order_history_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "product_name" VARCHAR(100) NOT NULL,
    "image" VARCHAR(300) NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_orders_pkey" PRIMARY KEY ("product_order_history_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_refresh_token_key" ON "users"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "otp_email_key" ON "otp"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_name_key" ON "products"("product_name");

-- CreateIndex
CREATE UNIQUE INDEX "deleted_products_product_id_key" ON "deleted_products"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "deleted_products_product_name_key" ON "deleted_products"("product_name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_name_key" ON "categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_product_id_key" ON "carts"("user_id", "product_id");

-- AddForeignKey
ALTER TABLE "categories_on_products" ADD CONSTRAINT "categories_on_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_on_products" ADD CONSTRAINT "categories_on_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_on_deleted_products" ADD CONSTRAINT "categories_on_deleted_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "deleted_products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_on_deleted_products" ADD CONSTRAINT "categories_on_deleted_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_orders" ADD CONSTRAINT "products_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;
