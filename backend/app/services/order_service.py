from sqlalchemy.orm import Session
from uuid import UUID
from decimal import Decimal

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


def create_order(db: Session, order_data: OrderCreate, current_user_id: UUID | None = None):
    user_id = current_user_id or order_data.user_id
    if not user_id:
        raise ValueError("User ID is required to create an order")

    if not order_data.items:
        raise ValueError("Order must contain at least one item")

    order = Order(
        user_id=user_id,
        status="Pending"
    )

    db.add(order)
    db.flush()

    total_price = Decimal("0.00")

    for item in order_data.items:
        if item.quantity <= 0:
            raise ValueError("Item quantity must be greater than 0")

        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise ValueError(f"Product not found: {item.product_id}")

        if not product.is_available:
            raise ValueError(f"Product '{product.name}' is currently unavailable")

        # Freeze product price at ordering time
        unit_price = Decimal(str(product.price))
        line_total = unit_price * item.quantity

        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=unit_price
        )

        db.add(order_item)
        total_price += line_total

    order.total_price = total_price

    db.commit()
    db.refresh(order)

    return order


def get_user_orders(db: Session, user_id: UUID):
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.id.desc()).all()


def get_all_orders(db: Session):
    return db.query(Order).order_by(Order.id.desc()).all()


def delete_order_by_id(db: Session, order_id: UUID):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None
    db.delete(order)
    db.commit()
    return order
