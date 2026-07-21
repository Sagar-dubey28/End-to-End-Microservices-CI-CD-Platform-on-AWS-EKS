package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type PaymentRequest struct {
	OrderID float64 `json:"order_id"`
	Amount  float64 `json:"amount"`
}

type PaymentResponse struct {
	TransactionID string `json:"transaction_id"`
	Status        string `json:"status"`
	Message       string `json:"message"`
}

func processPayment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		return
	}

	txnID := fmt.Sprintf("TXN-%d", time.Now().UnixNano())
	response := PaymentResponse{
		TransactionID: txnID,
		Status:        "SUCCESS",
		Message:       "Payment processed successfully",
	}

	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/api/payment/process", processPayment)
	log.Println("Payment Service (Golang) running on port 8085...")
	log.Fatal(http.ListenAndServe(":8085", nil))
}