from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class OrderRequest(BaseModel):
    user_id: str
    items: List[dict]
    total_amount: float
    shipping_address: str

orders_db = []

@app.post("/api/orders")
def create_order(order: OrderRequest):
    new_order = order.dict()
    new_order["id"] = f"ORD-{len(orders_db) + 1001}"
    new_order["status"] = "CONFIRMED"
    orders_db.append(new_order)
    return {"message": "Order placed successfully", "order": new_order}

@app.get("/api/orders/{user_id}")
def get_user_orders(user_id: str):
    user_orders = [o for o in orders_db if o["user_id"] == user_id]
    return user_orders