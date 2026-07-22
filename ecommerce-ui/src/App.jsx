import React, { useState } from 'react';
import { 
  ShoppingBag, Search, User, ShoppingCart, Heart, Shield,
  Truck, ArrowRight, CheckCircle2, ChevronRight, Star, Plus, Minus, X
} from 'lucide-react';
import axios from 'axios';

// User Service API URL
const USER_SERVICE_URL = 'http://13.207.197.125:8081';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Premium Leather Jacket', price: 4999, category: 'Fashion', rating: 4.8, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500' },
  { id: 2, name: 'Wireless Noise-Canceling Headphones', price: 8999, category: 'Electronics', rating: 4.9, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
  { id: 3, name: 'Minimalist Analog Watch', price: 2999, category: 'Accessories', rating: 4.6, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
  { id: 4, name: 'Urban Running Shoes', price: 3499, category: 'Footwear', rating: 4.7, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
  { id: 5, name: 'Smart Fitness Band', price: 1999, category: 'Electronics', rating: 4.5, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500' },
  { id: 6, name: 'Ergonomic Backpack', price: 2499, category: 'Accessories', rating: 4.8, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // home, auth, cart, checkout, orders
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); // login or signup
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [authStatus, setAuthStatus] = useState({ loading: false, error: '', success: '' });

  // Shipping Form State
  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', zip: '', phone: ''
  });

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('home');
  };

  // ✅ FIXED: Real Auth Handling with DB Sync
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthStatus({ loading: true, error: '', success: '' });

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      
      // Fixed payload field mapping (fullName instead of name for Spring Boot DTO)
      const payload = authMode === 'login' 
        ? { email: authData.email, password: authData.password }
        : { fullName: authData.name, email: authData.email, password: authData.password };

      const response = await axios.post(`${USER_SERVICE_URL}${endpoint}`, payload);

      setAuthStatus({ 
        loading: false, 
        error: '', 
        success: authMode === 'login' ? 'Login Successful!' : 'Registration Successful!' 
      });
      
      // Response handling fixed
      const loggedUser = response.data.user || response.data;
      setUser({
        name: loggedUser.fullName || loggedUser.name || authData.name || 'User',
        email: loggedUser.email || authData.email,
        id: loggedUser.id
      });

      setTimeout(() => {
        setCurrentScreen('home');
        setAuthStatus({ loading: false, error: '', success: '' });
      }, 1000);

    } catch (err) {
      console.error('Auth Error:', err);
      // Removed dummy local fallback so real DB errors are displayed
      const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to authenticate. Check Backend/DB connection.';
      setAuthStatus({ 
        loading: false, 
        error: typeof errorMsg === 'string' ? errorMsg : 'Authentication failed', 
        success: '' 
      });
    }
  };

  // Cart Operations
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Place Order Simulation
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrder = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      items: cart,
      total: cartSubtotal,
      address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zip}`,
      status: 'Processing',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setCurrentScreen('orders');
  };

  // Filtered Products
  const filteredProducts = INITIAL_PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <button onClick={() => setCurrentScreen('home')} className="flex items-center gap-2 text-xl font-bold text-slate-900 tracking-tight">
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span>NovaStore</span>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-full focus:bg-white focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* User & Cart Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentScreen('orders')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  My Orders
                </button>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden md:block">{user.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition ml-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentScreen('auth')}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setCurrentScreen('cart')}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Screen Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HOME SCREEN */}
        {currentScreen === 'home' && (
          <div>
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-lg relative overflow-hidden">
              <div className="relative z-10 max-w-xl">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
                  New Season Arrival
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                  Upgrade Your Daily Lifestyle.
                </h1>
                <p className="text-indigo-100 text-sm sm:text-base mb-6">
                  Discover curated fashion, tech essentials, and accessories tailored for performance and style.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
              {['All', 'Fashion', 'Electronics', 'Accessories', 'Footwear'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
                  <div className="h-56 bg-slate-100 relative overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{product.rating}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mb-2">{product.name}</h3>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 block">Price</span>
                        <span className="text-lg font-extrabold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUTHENTICATION SCREEN */}
        {currentScreen === 'auth' && (
          <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-2">
              {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6">
              Connected with User Service (<code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">http://13.207.197.125:8081</code>)
            </p>

            {authStatus.error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 border border-red-100">
                {authStatus.error}
              </div>
            )}
            {authStatus.success && (
              <div className="bg-emerald-50 text-emerald-600 text-xs p-3 rounded-xl mb-4 border border-emerald-100">
                {authStatus.success}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authData.name}
                    onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Sagar Dubey"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  placeholder="sagar@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={authStatus.loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-md disabled:opacity-50"
              >
                {authStatus.loading ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        )}

        {/* CART SCREEN */}
        {currentScreen === 'cart' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Shopping Cart</h2>

            {cart.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Your cart is empty.</p>
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-slate-100" />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                        <span className="text-xs text-slate-400">{item.category}</span>
                        <div className="text-sm font-extrabold text-slate-900 mt-1">₹{item.price.toLocaleString('en-IN')}</div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-lg text-slate-600 transition">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold px-2">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-lg text-slate-600 transition">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 h-fit space-y-4">
                  <h3 className="font-bold text-slate-900 text-base">Order Summary</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
                    <span>Total</span>
                    <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <button
                    onClick={() => setCurrentScreen(user ? 'checkout' : 'auth')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Proceed to Checkout</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHECKOUT SCREEN */}
        {currentScreen === 'checkout' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Shipping Details</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  placeholder="123 Maharana Pratap Nagar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Bhopal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Madhya Pradesh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.zip}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                    placeholder="462001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-slate-700">Total Payment</span>
                  <span className="text-xl font-extrabold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md"
                >
                  Confirm & Place Order
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ORDERS SCREEN */}
        {currentScreen === 'orders' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Order History</h2>
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <p className="text-slate-500 font-medium">No orders placed yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-600">{order.id}</span>
                        <div className="text-xs text-slate-400 mt-0.5">{order.date}</div>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-700">{item.name} x {item.quantity}</span>
                          <span className="font-semibold text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                      <span className="text-xs text-slate-500">Deliver to: {order.address}</span>
                      <span className="font-extrabold text-slate-900">Total: ₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}  