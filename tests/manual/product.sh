curl -X POST "http://localhost:3000/api/products" --header "Content-Type: application/json" \
--header "Authorization: rahasia" --data '{
    "name": "PRODUCT TEST",
    "image": "IMAGE TEST",
    "price": 10000,
    "stock": 250,
    "description": "DESCRIPTION TEST",
    "categories": ["abcd", "abcdefg"]
}' | jq 