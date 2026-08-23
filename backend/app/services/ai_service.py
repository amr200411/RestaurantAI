import os
import re
import json
from typing import List, Dict, Any, Optional
from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.product import Product
from app.services import admin_tools

# Import Google GenAI SDK
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


# Clean Tool Function Wrappers for Gemini LLM Function Declarations
def get_sales_summary() -> dict:
    """Get total revenue, total order count, average order value, and delivered revenue breakdown."""
    return {}

def get_top_products(limit: int = 5) -> dict:
    """Get top selling products by quantity sold and top products by revenue."""
    return {}

def get_product_performance(product_name: str) -> dict:
    """Get sales quantity, revenue, and performance details for a specific product."""
    return {}

def get_category_performance() -> dict:
    """Get breakdown of category performance, total units, revenue, best and worst category."""
    return {}

def get_order_statistics() -> dict:
    """Get breakdown of orders by status (Pending, Confirmed, Preparing, Ready, Delivered, Cancelled)."""
    return {}

def get_customer_statistics() -> dict:
    """Get total customer users, top ordering customers, and average orders per customer."""
    return {}

def get_sales_by_period(period: str = "this_month") -> dict:
    """Get sales for today, this week, this month, or last month."""
    return {}

def get_low_performing_products(limit: int = 5) -> dict:
    """Get products with lowest sales or zero sales needing promotional attention."""
    return {}


def process_ai_recommendation(db: Session, query: str) -> Dict[str, Any]:
    """Customer Food Recommendation Assistant (Preserved and unbroken)."""
    query_lower = query.lower().strip()
    products = db.query(Product).filter(Product.is_available == True).all()

    if not products:
        return {
            "reply": "نعتذر، لا توجد أطباق متاحة حالياً في القائمة.",
            "recommended_products": []
        }

    max_budget = None
    numbers = re.findall(r'\b\d+(?:\.\d+)?\b', query_lower)
    if numbers:
        try:
            max_budget = Decimal(numbers[0])
        except Exception:
            pass

    is_cheap = "رخيص" in query_lower or "cheap" in query_lower or "اقتصادي" in query_lower
    exclude_chicken = "بدون دجاج" in query_lower or "no chicken" in query_lower or "دون دجاج" in query_lower
    exclude_meat = "بدون لحم" in query_lower or "no meat" in query_lower or "نباتي" in query_lower or "vegetarian" in query_lower
    for_two = "لشخصين" in query_lower or "for 2" in query_lower or "person 2" in query_lower or "شخصين" in query_lower

    filtered = []
    for p in products:
        p_name = p.name.lower()
        p_desc = (p.description or "").lower()
        full_text = f"{p_name} {p_desc}"

        if exclude_chicken and ("دجاج" in full_text or "chicken" in full_text):
            continue

        if exclude_meat and ("لحم" in full_text or "meat" in full_text or "دجاج" in full_text or "chicken" in full_text or "burger" in full_text):
            continue

        if max_budget and p.price > max_budget:
            continue

        filtered.append(p)

    if is_cheap:
        filtered.sort(key=lambda x: x.price)
    elif max_budget:
        filtered.sort(key=lambda x: x.price, reverse=True)
    else:
        def rank_match(p):
            score = 0
            for word in query_lower.split():
                if len(word) > 2 and word in (p.name + " " + (p.description or "")).lower():
                    score += 1
            return score
        filtered.sort(key=rank_match, reverse=True)

    if not filtered:
        recommendations = products[:3]
        reply_msg = f"لم نجد أطباق مطابقة تماماً لـ '{query}'، ولكن إليك أفضل التوصيات من قائمتنا المميزة:"
    else:
        recommendations = filtered[:4]
        if for_two:
            reply_msg = f"إليك أفضل اقتراحات الوجبات المناسبة لشخصين بناءً على طلبك ({query}):"
        elif max_budget:
            reply_msg = f"إليك أشهى الأطباق ضمن ميزانيتك (أقل من {max_budget} ليرة):"
        elif exclude_chicken or exclude_meat:
            reply_msg = f"إليك الأطباق الممتازة المناسبة لتفضيلاتك الغذائية:"
        else:
            reply_msg = f"إليك أفضل الأطباق الموصى بها بناءً على طلبك:"

    return {
        "reply": reply_msg,
        "recommended_products": recommendations
    }


def _execute_tool_by_name(db: Session, tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    """Helper to execute database tools by name safely on PostgreSQL."""
    tool_map = {
        "get_sales_summary": lambda: admin_tools.get_sales_summary(db),
        "get_top_products": lambda: admin_tools.get_top_products(db, limit=args.get("limit", 5)),
        "get_product_performance": lambda: admin_tools.get_product_performance(db, product_name=args.get("product_name", "")),
        "get_category_performance": lambda: admin_tools.get_category_performance(db),
        "get_order_statistics": lambda: admin_tools.get_order_statistics(db),
        "get_customer_statistics": lambda: admin_tools.get_customer_statistics(db),
        "get_sales_by_period": lambda: admin_tools.get_sales_by_period(db, period=args.get("period", "this_month")),
        "get_low_performing_products": lambda: admin_tools.get_low_performing_products(db, limit=args.get("limit", 5)),
    }

    fn = tool_map.get(tool_name)
    if fn:
        return fn()
    return {"error": f"Tool '{tool_name}' not implemented."}


def process_admin_ai_query(db: Session, query: str) -> Dict[str, Any]:
    """
    Admin AI Business Assistant using Google Gemini API with Function Calling / Tools.
    Accesses PostgreSQL database strictly via Backend Database Tools.
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    query_lower = query.lower().strip()

    # Attempt real Gemini LLM tool calling if API key is present & SDK is available
    if gemini_api_key and GENAI_AVAILABLE and gemini_api_key.strip():
        try:
            client = genai.Client(api_key=gemini_api_key.strip())

            tools_list = [
                get_sales_summary,
                get_top_products,
                get_product_performance,
                get_category_performance,
                get_order_statistics,
                get_customer_statistics,
                get_sales_by_period,
                get_low_performing_products,
            ]

            system_instruction = (
                "You are the executive AI Business Advisor for RestaurantAI. "
                "You analyze restaurant performance using backend database tools ONLY. "
                "CRITICAL RULES:\n"
                "1. NEVER invent or guess numbers. Always use backend database tools to retrieve actual data.\n"
                "2. Clearly separate your response into 3 structured sections:\n"
                "   • 📊 **البيانات الفعلية (Actual Data)**: Present numbers retrieved from database tools.\n"
                "   • 💡 **التحليل والاستنتاج (Analysis & Insights)**: Explain what the data means.\n"
                "   • 🎯 **التوصيات (Actionable Recommendations)**: Provide practical business advice.\n"
                "3. Answer in the same language as the user query (Arabic or English).\n"
                "4. Be professional, concise, and analytical."
            )

            model_name = "gemini-3.6-flash"


            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=tools_list,
                temperature=0.2,
            )

            # First turn: Send query to Gemini
            response = client.models.generate_content(
                model=model_name,
                contents=query,
                config=config,
            )

            # Check if Gemini requested function execution
            executed_metrics = {}
            if response.function_calls:
                function_responses = []
                for fc in response.function_calls:
                    fname = fc.name
                    fargs = fc.args or {}
                    tool_result = _execute_tool_by_name(db, fname, fargs)
                    executed_metrics[fname] = tool_result

                    function_responses.append(
                        types.Part.from_function_response(
                            name=fname,
                            response={"result": tool_result}
                        )
                    )

                # Second turn: Send tool execution results back to Gemini for final analysis
                followup_config = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2,
                )
                final_response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Content(role="user", parts=[types.Part.from_text(text=query)]),
                        response.candidates[0].content,
                        types.Content(role="user", parts=function_responses),
                    ],
                    config=followup_config,
                )
                return {
                    "reply": final_response.text,
                    "metrics": executed_metrics,
                    "engine": "Google Gemini 2.5 Flash (Function Calling)"
                }
            else:
                return {
                    "reply": response.text,
                    "metrics": {},
                    "engine": "Google Gemini 2.5 Flash"
                }

        except Exception as e:
            print(f"[Gemini API Exception]: {e}")

    # DIRECT DATABASE TOOL FALLBACK (Used when GEMINI_API_KEY is not set or network error occurs)
    used_metrics = {}
    reply_parts = []

    if any(k in query_lower for k in ["pending", "معلق", "معلقة", "status", "حالة"]):
        data = admin_tools.get_order_statistics(db)
        used_metrics = data
        reply_parts.append(
            f"📊 **البيانات الفعلية (Actual Data)**:\n"
            f"• إجمالي الطلبات الكلي: {data['total_orders']}\n"
            f"• الطلبات المعلقة (Pending): {data['status_breakdown']['Pending']}\n"
            f"• جاري التحضير (Preparing): {data['status_breakdown']['Preparing']}\n"
            f"• جاهزة (Ready): {data['status_breakdown']['Ready']}\n"
            f"• تم التوصيل (Delivered): {data['status_breakdown']['Delivered']}\n\n"
            f"💡 **التحليل والاستنتاج (Analysis)**:\n"
            f"الطلبات المعلقة تمثل {data['status_breakdown']['Pending']} طلبات بحاجة لمعالجة سريعة.\n\n"
            f"🎯 **التوصيات (Recommendation)**:\n"
            f"قم بإنهاء معالجة الطلبات المعلقة لتسريع زمن التسليم للعملاء."
        )

    elif any(k in query_lower for k in ["least", "lowest", "أقل", "الاقل", "ضعيف", "لا تحظى"]):
        data = admin_tools.get_low_performing_products(db, limit=5)
        used_metrics = data
        low_list = ", ".join([f"{p['name']} ({p['units_sold']} وحدة)" for p in data['lowest_selling_active']])
        reply_parts.append(
            f"📊 **البيانات الفعلية (Actual Data)**:\n"
            f"• المنتجات الأقل مبيعاً: {low_list}\n\n"
            f"💡 **التحليل والاستنتاج (Analysis)**:\n"
            f"هذه المنتجات تسجل مبيعات منخفضة مقارنة بالأطباق الأخرى في القائمة.\n\n"
            f"🎯 **التوصيات (Recommendation)**:\n"
            f"نقترح تحسين صور وتوصيفات هذه المنتجات، أو تقديم خصم ترويجي لفترة محدودة قبل إزالتها من القائمة."
        )

    elif any(k in query_lower for k in ["category", "categories", "قسم", "تصنيف", "أقسام"]):
        data = admin_tools.get_category_performance(db)
        used_metrics = data
        cat_str = "\n".join([f"• {c['category_name']}: {c['revenue']} ₺ ({c['units_sold']} وحدة)" for c in data['categories']])
        reply_parts.append(
            f"📊 **البيانات الفعلية (Actual Data)**:\n{cat_str}\n\n"
            f"💡 **التحليل والاستنتاج (Analysis)**:\n"
            f"القسم الأكثر تحقيقاً للإيرادات هو '{data['best_category']}'.\n\n"
            f"🎯 **التوصيات (Recommendation)**:\n"
            f"ركز الحملات التسويقية على تصنيف '{data['best_category']}' لتعظيم الربحية."
        )

    elif any(k in query_lower for k in ["top 5", "best sell", "popular", "أفضل", "الأكثر مبيع", "الأكثر طلب"]):
        data = admin_tools.get_top_products(db, limit=5)
        used_metrics = data
        top_str = "\n".join([f"• {p['name']}: {p['units_sold']} وحدة ({p['revenue']} ₺)" for p in data['top_by_quantity']])
        top_p = data['top_by_quantity'][0]['name'] if data['top_by_quantity'] else 'المنتج الشهير'
        top_units = data['top_by_quantity'][0]['units_sold'] if data['top_by_quantity'] else 0
        reply_parts.append(
            f"📊 **البيانات الفعلية (Actual Data)**:\n{top_str}\n\n"
            f"💡 **التحليل والاستنتاج (Analysis)**:\n"
            f"الـ {top_p} هو المنتج الأكثر مبيعاً بـ {top_units} وحدة. وهو حالياً أفضل منتج لديك من حيث حجم المبيعات.\n\n"
            f"🎯 **التوصيات (Recommendation)**:\n"
            f"بناءً على البيانات الحالية، أقترح استخدامه كمنتج رئيسي في العروض الترويجية وربطه بمشروب أو side لزيادة متوسط قيمة الطلب."
        )

    else:
        # Default comprehensive sales summary
        data_sales = admin_tools.get_sales_summary(db)
        data_top = admin_tools.get_top_products(db, limit=3)
        data_cats = admin_tools.get_category_performance(db)
        used_metrics = {"sales": data_sales, "top_products": data_top, "categories": data_cats}

        top_prod_name = data_top['top_by_quantity'][0]['name'] if data_top['top_by_quantity'] else 'N/A'
        top_prod_units = data_top['top_by_quantity'][0]['units_sold'] if data_top['top_by_quantity'] else 0

        reply_parts.append(
            f"📊 **البيانات الفعلية المباشرة من PostgreSQL**:\n"
            f"• إجمالي الإيرادات: {data_sales['total_revenue']} ₺\n"
            f"• إجمالي عدد الطلبات: {data_sales['total_orders']}\n"
            f"• متوسط قيمة الطلب: {data_sales['average_order_value']} ₺\n"
            f"• المنتج الأعلى مبيعاً: {top_prod_name} ({top_prod_units} وحدة)\n"
            f"• القسم الأعلى أداءً: {data_cats['best_category']}\n\n"
            f"💡 **التحليل والاستنتاج (Analysis)**:\n"
            f"المطعم يحقق أداءً جيداً ومستقراً مع تركز المبيعات في قسم {data_cats['best_category']} "
            f"والمنتج الرئيسي {top_prod_name}.\n\n"
            f"🎯 **التوصيات (Actionable Recommendations)**:\n"
            f"1. إنشاء وجبات مجمعة (Combo Deals) تجمع بين {top_prod_name} والمشروبات لزيادة متوسط قيمة الطلب فوق {data_sales['average_order_value']} ₺.\n"
            f"2. تقديم عروض ترويجية مستهدفة للأصناف ذات الإقبال المتوسط لتوزيع الإيرادات بشكل متوازن.\n"
            f"3. متابعة زمن تجهيز الطلبات المعلقة لرفع نسبة رضا العملاء."
        )

    return {
        "reply": "\n".join(reply_parts),
        "metrics": used_metrics,
        "engine": "PostgreSQL Direct Business Tools Analytics (Configure GEMINI_API_KEY in backend/.env for Gemini LLM)"
    }
