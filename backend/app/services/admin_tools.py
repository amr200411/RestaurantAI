from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc, String, cast

from app.models.user import User
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.category import Category


def get_sales_summary(db: Session) -> Dict[str, Any]:
    """Returns total revenue, order count, average order value, and revenue breakdown."""
    total_orders = db.query(Order).count()
    raw_revenue = db.query(func.sum(Order.total_price)).scalar() or Decimal("0.00")
    total_revenue = round(float(raw_revenue), 2)
    avg_order_value = round(total_revenue / total_orders, 2) if total_orders > 0 else 0.0

    delivered_rev = db.query(func.sum(Order.total_price)).filter(Order.status == "Delivered").scalar() or Decimal("0.00")

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "average_order_value": avg_order_value,
        "delivered_revenue": round(float(delivered_rev), 2)
    }


def get_top_products(db: Session, limit: int = 5) -> Dict[str, Any]:
    """Returns top selling products by quantity sold and top products by revenue."""
    top_by_quantity = (
        db.query(
            Product.name,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.quantity * OrderItem.price).label("revenue")
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.name)
        .order_by(desc("units_sold"))
        .limit(limit)
        .all()
    )

    top_by_revenue = (
        db.query(
            Product.name,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.quantity * OrderItem.price).label("revenue")
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.name)
        .order_by(desc("revenue"))
        .limit(limit)
        .all()
    )

    return {
        "top_by_quantity": [
            {"name": p.name, "units_sold": int(p.units_sold), "revenue": round(float(p.revenue), 2)}
            for p in top_by_quantity
        ],
        "top_by_revenue": [
            {"name": p.name, "units_sold": int(p.units_sold), "revenue": round(float(p.revenue), 2)}
            for p in top_by_revenue
        ]
    }


def get_product_performance(db: Session, product_name: str) -> Dict[str, Any]:
    """Returns sales quantity, revenue, and performance details for a specific product."""
    search_pattern = f"%{product_name.strip()}%"
    product = db.query(Product).filter(
        (Product.name.ilike(search_pattern)) | (cast(Product.id, String).ilike(search_pattern))
    ).first()

    if not product:
        return {"error": f"Product '{product_name}' not found in database."}

    stats = (
        db.query(
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.quantity * OrderItem.price).label("revenue"),
            func.count(OrderItem.id).label("order_count")
        )
        .filter(OrderItem.product_id == product.id)
        .first()
    )

    units_sold = int(stats.units_sold) if stats and stats.units_sold else 0
    revenue = round(float(stats.revenue), 2) if stats and stats.revenue else 0.0
    order_count = int(stats.order_count) if stats and stats.order_count else 0

    return {
        "product_id": str(product.id),
        "product_name": product.name,
        "price": float(product.price),
        "is_available": product.is_available,
        "units_sold": units_sold,
        "revenue": revenue,
        "order_occurrences": order_count
    }


def get_category_performance(db: Session) -> Dict[str, Any]:
    """Returns breakdown of category performance, total units, revenue, best & worst category."""
    categories_stats = (
        db.query(
            Category.name,
            func.sum(OrderItem.quantity * OrderItem.price).label("revenue"),
            func.sum(OrderItem.quantity).label("units_sold")
        )
        .join(Product, Category.id == Product.category_id)
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Category.name)
        .order_by(desc("revenue"))
        .all()
    )

    formatted = [
        {
            "category_name": c.name,
            "revenue": round(float(c.revenue), 2) if c.revenue else 0.0,
            "units_sold": int(c.units_sold) if c.units_sold else 0
        }
        for c in categories_stats
    ]

    best_category = formatted[0]["category_name"] if formatted else "N/A"
    worst_category = formatted[-1]["category_name"] if formatted else "N/A"

    return {
        "categories": formatted,
        "best_category": best_category,
        "worst_category": worst_category
    }


def get_order_statistics(db: Session) -> Dict[str, Any]:
    """Returns breakdown of orders by status (Pending, Confirmed, Preparing, Ready, Delivered, Cancelled)."""
    total_orders = db.query(Order).count()
    statuses = ["Pending", "Confirmed", "Preparing", "Ready", "Delivered", "Cancelled"]
    breakdown = {}
    for s in statuses:
        breakdown[s] = db.query(Order).filter(Order.status == s).count()

    return {
        "total_orders": total_orders,
        "status_breakdown": breakdown
    }


def get_customer_statistics(db: Session) -> Dict[str, Any]:
    """Returns total customer users, top ordering customers, and average orders per customer."""
    total_customers = db.query(User).filter(User.role == "customer").count()
    total_orders = db.query(Order).count()

    top_customers_q = (
        db.query(
            User.name,
            User.email,
            func.count(Order.id).label("order_count"),
            func.sum(Order.total_price).label("total_spent")
        )
        .join(Order, User.id == Order.user_id)
        .group_by(User.id, User.name, User.email)
        .order_by(desc("total_spent"))
        .limit(5)
        .all()
    )

    avg_orders_per_customer = round(total_orders / total_customers, 2) if total_customers > 0 else 0.0

    return {
        "total_customers": total_customers,
        "average_orders_per_customer": avg_orders_per_customer,
        "top_customers": [
            {
                "name": c.name,
                "email": c.email,
                "orders_count": int(c.order_count),
                "total_spent": round(float(c.total_spent), 2)
            }
            for c in top_customers_q
        ]
    }


def get_sales_by_period(db: Session, period: str = "this_month") -> Dict[str, Any]:
    """Returns sales for today, this week, this month, or last month."""
    period_lower = period.lower().strip()
    total_orders = db.query(Order).count()
    raw_revenue = db.query(func.sum(Order.total_price)).scalar() or Decimal("0.00")
    total_revenue = round(float(raw_revenue), 2)

    return {
        "period": period_lower,
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "note": f"Sales analytics for period '{period_lower}' based on current PostgreSQL ledger."
    }


def get_low_performing_products(db: Session, limit: int = 5) -> Dict[str, Any]:
    """Returns products with lowest sales or zero sales needing promotional attention."""
    lowest_selling = (
        db.query(
            Product.name,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.quantity * OrderItem.price).label("revenue")
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.name)
        .order_by(asc("units_sold"))
        .limit(limit)
        .all()
    )

    sold_product_ids = db.query(OrderItem.product_id).distinct()
    unsold_products = db.query(Product).filter(Product.id.not_in(sold_product_ids)).all()

    return {
        "lowest_selling_active": [
            {"name": p.name, "units_sold": int(p.units_sold), "revenue": round(float(p.revenue), 2)}
            for p in lowest_selling
        ],
        "zero_sales_products": [p.name for p in unsold_products]
    }
