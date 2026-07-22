# Stage 1: Build React App
FROM node:20-alpine AS builder
ARG VITE_USER_SERVICE_URL
ARG VITE_CART_SERVICE_URL
ARG VITE_ORDER_SERVICE_URL
ARG VITE_PAYMENT_SERVICE_URL
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN printf "VITE_USER_SERVICE_URL=%s\nVITE_CART_SERVICE_URL=%s\nVITE_ORDER_SERVICE_URL=%s\nVITE_PAYMENT_SERVICE_URL=%s\n" "${VITE_USER_SERVICE_URL:-http://localhost:8081}" "${VITE_CART_SERVICE_URL:-http://localhost:8083}" "${VITE_ORDER_SERVICE_URL:-http://localhost:8084}" "${VITE_PAYMENT_SERVICE_URL:-http://localhost:8085}" > .env
RUN npm run build

# Stage 2: Serve using Lightweight Nginx Web Server
FROM nginx:alpine
# Built dist folder ko Nginx HTML directory me copy karo
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]