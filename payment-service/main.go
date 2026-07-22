package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type PaymentRequest struct {
	OrderID string  `json:"order_id"`
	Amount  float64 `json:"amount"`
}

type PaymentResponse struct {
	TransactionID string `json:"transaction_id"`
	Status        string `json:"status"`
	Message       string `json:"message"`
}

func processPayment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var paymentReq PaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&paymentReq); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid payment request payload"})
		return
	}

	if paymentReq.OrderID == "" || paymentReq.Amount <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid order_id or amount"})
		return
	}

	txnID := fmt.Sprintf("TXN-%d", time.Now().UnixNano())
	response := PaymentResponse{
		TransactionID: txnID,
		Status:        "SUCCESS",
		Message:       fmt.Sprintf("Payment of %.2f for order %s processed successfully", paymentReq.Amount, paymentReq.OrderID),
	}

	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/api/payment/process", processPayment)
	log.Println("Payment Service (Golang) running on port 8085...")
	log.Fatal(http.ListenAndServe(":8085", nil))
}