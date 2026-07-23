// @ts-nocheck -- legacy page, pending UI-11 TypeScript alignment pass
import React, { useEffect, useState } from "react";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
// import Carousel from "react-grid-carousel";
// import { useRef } from "react";
import { useRef } from "react";

import {
  decrement,
  increment,
  set,
  selectQuantityById,
} from "../../redux/slices/retailer/itemsQuantitySlice";
import noImage from "../../assets/images/no_image.jpg";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import {
  add_product_to_cart,
  cancel_order_from_cart,
  delete_product_in_cart,
} from "../../redux/services/retailer/retailerHomepage.service";
import {
  AddProductToCart,
  deleteProductInCart,
  getAllProductByStoreId,
} from "../../redux/slices/retailer/homepageSlice/allShopSlice";
import { ToastContainer, toast } from "react-toastify";
import { ShoppingCart } from "lucide-react";
import { useSearchParams } from "next/navigation";

import ProductCard from "../../components/retailler/ProductCard";

export default function AllProducts() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const id = searchParams.get("storeId");
  const storeName = searchParams.get("storeName");

  const timeoutRef = useRef();

  const { productData } = useSelector((state) => state.getDataAllShop);

  const [loadingProducts, setLoadingProducts] = useState(new Set());
  const [loadingProducts2, setLoadingProducts2] = useState(new Set());
  const [isLoadingInputs, setIsLoadingInputs] = useState(new Set());
  const [disabledButtons, setDisabledButtons] = useState(new Set());

  const [counterLocalStorage, setCounterLocalStorage] = useState(
    JSON.parse(localStorage.getItem("counter")) || {},
  );

  useEffect(() => {
    const syncCounterFromLocalStorage = () => {
      const storedCounter = JSON.parse(localStorage.getItem("counter"));
      if (storedCounter) {
        setCounterLocalStorage(storedCounter);
      }
    };

    window.addEventListener("storage", syncCounterFromLocalStorage);
    window.addEventListener("localStorageUpdated", syncCounterFromLocalStorage);

    return () => {
      window.removeEventListener("storage", syncCounterFromLocalStorage);
      window.removeEventListener(
        "localStorageUpdated",
        syncCounterFromLocalStorage,
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const { productInCartData } = useSelector((state) => state.getDataAllShop);

  const handleIncrement = async (productId) => {
    if (!localStorage.getItem("storeIdLocalStorage")) {
      localStorage.setItem("storeIdLocalStorage", id);
    }
    if (!localStorage.getItem("storeNameLocalStorage")) {
      localStorage.setItem("storeNameLocalStorage", storeName);
    }

    const product = productData.find((item) => item.id === productId);

    setDisabledButtons((prev) => new Set(prev).add(productId));
    setLoadingProducts((prev) => new Set(prev).add(productId));

    const currentValue = parseInt(counterLocalStorage[productId] || 0);
    const qty = currentValue + 1;

    try {
      const response = await add_product_to_cart(id, productId, qty);

      if (response.status === 401) {
        toast.error("Please login to continue.");
      } else if (response.data.detail?.includes("Not enough product")) {
        toast.warning("Product is running out of stock.");
      } else if (response.data.detail?.includes("One cart is processing")) {
        toast.error("You can only have one active cart at a time.");
      } else if (response.data.detail?.includes("User have no profile")) {
        toast.error("Please setup your profile to order.");
      } else {
        dispatch(AddProductToCart(response.data.data));
        dispatch(increment({ productId }));

        const updatedCounters = { ...counterLocalStorage, [productId]: qty };
        setCounterLocalStorage(updatedCounters);
        localStorage.setItem("counter", JSON.stringify(updatedCounters));
        window.dispatchEvent(
          new CustomEvent("localStorageUpdated", { detail: updatedCounters }),
        );
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingProducts((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setDisabledButtons((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
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
        if (productInCartData.length === 1) {
          await cancel_order_from_cart();
        }
      } else {
        const response = await add_product_to_cart(id, productId, qty);
        dispatch(AddProductToCart(response.data.data));
      }

      dispatch(decrement({ productId }));

      const updatedCounters = { ...counterLocalStorage, [productId]: qty };
      setCounterLocalStorage(updatedCounters);
      localStorage.setItem("counter", JSON.stringify(updatedCounters));
      window.dispatchEvent(
        new CustomEvent("localStorageUpdated", { detail: updatedCounters }),
      );
    } catch (error) {
    } finally {
      setLoadingProducts2((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setDisabledButtons((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleInputChange = async (productId, e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) return;

    if (value === 0) {
      handleDecrement(productId); // Reuse decrement logic for 0
      return;
    }

    const product = productData.find((item) => item.id === productId);
    if (product && product.qty < value) {
      toast.warn("Not enough stock available.");
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setIsLoadingInputs((prev) => new Set(prev).add(productId));
      try {
        const response = await add_product_to_cart(id, productId, value);
        if (response.status === 409) {
          toast.error("You can only have one active cart at a time.");
        } else {
          dispatch(AddProductToCart(response.data.data));
          dispatch(set({ productId, quantity: value }));

          const updatedCounters = {
            ...counterLocalStorage,
            [productId]: value,
          };
          setCounterLocalStorage(updatedCounters);
          localStorage.setItem("counter", JSON.stringify(updatedCounters));
          window.dispatchEvent(
            new CustomEvent("localStorageUpdated", { detail: updatedCounters }),
          );
        }
      } finally {
        setIsLoadingInputs((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
    }, 1000);
  };

  return (
    <div className="w-full">
      <ToastContainer />
      {productData && productData.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productData.map((item) => (
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
          <h3 className="mt-6 text-xl font-bold text-slate-900 ">
            No Products Found
          </h3>
          <p className="mt-2 text-slate-500">
            This distributor hasn't listed any products yet.
          </p>
        </div>
      )}
    </div>
  );
}
