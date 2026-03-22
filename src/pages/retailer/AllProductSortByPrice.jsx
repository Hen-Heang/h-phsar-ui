import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import { ShoppingCart } from "lucide-react";
import ProductCard from "../../components/retailler/ProductCard";
import { 
  decrement, 
  increment, 
  set 
} from '../../redux/slices/retailer/itemsQuantitySlice';
import { 
  add_product_to_cart, 
  cancel_order_from_cart, 
  delete_product_in_cart 
} from '../../redux/services/retailer/retailerHomepage.service';
import { 
  AddProductToCart, 
  deleteProductInCart 
} from '../../redux/slices/retailer/homepageSlice/allShopSlice';

export default function AllProductSortByPrice() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const timeoutRef = useRef();

  const id = searchParams.get("storeId");
  const storeName = searchParams.get("storeName");
  
  const { productByPriceData } = useSelector((state) => state.getDataAllShop);
  const { productInCartData } = useSelector((state) => state.getDataAllShop);

  const [disabledButtons, setDisabledButtons] = useState(new Set());
  const [loadingProducts, setLoadingProducts] = useState(new Set());
  const [loadingProducts2, setLoadingProducts2] = useState(new Set());
  const [isLoadingInputs, setIsLoadingInputs] = useState(new Set());

  const [counterLocalStorage, setCounterLocalStorage] = useState(
    JSON.parse(localStorage.getItem('counter')) || {}
  );

  useEffect(() => {
    const syncCounter = () => {
      const stored = JSON.parse(localStorage.getItem('counter'));
      if (stored) setCounterLocalStorage(stored);
    };
    window.addEventListener("storage", syncCounter);
    window.addEventListener("localStorageUpdated", syncCounter);
    return () => {
      window.removeEventListener("storage", syncCounter);
      window.removeEventListener("localStorageUpdated", syncCounter);
    };
  }, []);

  const handleIncrement = async (productId) => {
    if (!localStorage.getItem("storeIdLocalStorage")) localStorage.setItem("storeIdLocalStorage", id);
    if (!localStorage.getItem("storeNameLocalStorage")) localStorage.setItem("storeNameLocalStorage", storeName);

    setDisabledButtons((prev) => new Set(prev).add(productId));
    setLoadingProducts((prev) => new Set(prev).add(productId));

    const currentValue = parseInt(counterLocalStorage[productId] || 0);
    const qty = currentValue + 1;

    try {
      const response = await add_product_to_cart(id, productId, qty);
      if (response.status === 401) {
        toast.error("Please login to continue.");
      } else {
        dispatch(AddProductToCart(response.data.data));
        dispatch(increment({ productId }));
        
        const updatedCounters = { ...counterLocalStorage, [productId]: qty };
        setCounterLocalStorage(updatedCounters);
        localStorage.setItem("counter", JSON.stringify(updatedCounters));
        window.dispatchEvent(new CustomEvent("localStorageUpdated", { detail: updatedCounters }));
      }
    } catch (error) {
      toast.error("Operation failed.");
    } finally {
      setLoadingProducts((prev) => { const n = new Set(prev); n.delete(productId); return n; });
      setDisabledButtons((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    }
  };

  const handleDecrement = async (productId) => {
    setDisabledButtons((prev) => new Set(prev).add(productId));
    setLoadingProducts2((prev) => new Set(prev).add(productId));

    const currentValue = parseInt(counterLocalStorage[productId] || 0);
    if (currentValue <= 0) return;

    const qty = currentValue - 1;

    try {
      if (currentValue === 1) {
        await delete_product_in_cart(productId);
        dispatch(deleteProductInCart(productId));
        if (productInCartData.length === 1) await cancel_order_from_cart();
      } else {
        const response = await add_product_to_cart(id, productId, qty);
        dispatch(AddProductToCart(response.data.data));
      }
      
      dispatch(decrement({ productId }));
      
      const updatedCounters = { ...counterLocalStorage, [productId]: qty };
      setCounterLocalStorage(updatedCounters);
      localStorage.setItem("counter", JSON.stringify(updatedCounters));
      window.dispatchEvent(new CustomEvent("localStorageUpdated", { detail: updatedCounters }));
    } finally {
      setLoadingProducts2((prev) => { const n = new Set(prev); n.delete(productId); return n; });
      setDisabledButtons((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    }
  };

  const handleInputChange = async (productId, e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) return;

    if (value === 0) {
      handleDecrement(productId);
      return;
    }

    const product = productByPriceData.find((item) => item.id === productId);
    if (product && product.qty < value) {
      toast.warn("Stock limit exceeded.");
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setIsLoadingInputs((prev) => new Set(prev).add(productId));
      try {
        const response = await add_product_to_cart(id, productId, value);
        dispatch(AddProductToCart(response.data.data));
        dispatch(set({ productId, quantity: value }));
        
        const updatedCounters = { ...counterLocalStorage, [productId]: value };
        setCounterLocalStorage(updatedCounters);
        localStorage.setItem("counter", JSON.stringify(updatedCounters));
        window.dispatchEvent(new CustomEvent("localStorageUpdated", { detail: updatedCounters }));
      } finally {
        setIsLoadingInputs((prev) => { const n = new Set(prev); n.delete(productId); return n; });
      }
    }, 1000);
  };

  return (
    <div className="w-full">
      <ToastContainer />
      {productByPriceData && productByPriceData.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:grid-cols-5">
          {productByPriceData.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              quantity={counterLocalStorage[item.id] || 0}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onInputChange={handleInputChange}
              isLoadingIncrement={loadingProducts.has(item.id)}
              isLoadingDecrement={loadingProducts2.has(item.id)}
              isLoadingInput={isLoadingInputs.has(item.id)}
              disabled={disabledButtons.has(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-white/50  ">
          <div className="rounded-full bg-slate-100 p-6 ">
            <ShoppingCart className="h-12 w-12 text-slate-300 " />
          </div>
          <h3 className="mt-6 text-xl font-bold text-slate-900 ">No Products Found</h3>
          <p className="mt-2 text-slate-500">No products matching your price criteria found.</p>
        </div>
      )}
    </div>
  );
}
