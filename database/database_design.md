# Restaurant AI Database Design

## Products Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique product ID |
| name | String | Product name |
| description | Text | Product description |
| current_price | Decimal | Current selling price |
| category_id | UUID | Reference to Categories table |
| image_url | String | Product image |
| is_available | Boolean | Is the product available? |
| created_at | Timestamp | Created date |
| updated_at | Timestamp | Last updated date |

---

## Notes

- Each product belongs to one category.
- Product price can change in the future.
- Price history will be stored in a separate table later.
- Inventory will also have its own table.