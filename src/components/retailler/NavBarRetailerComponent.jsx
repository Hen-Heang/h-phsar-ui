"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import AllNotification from "./notification/AllNotification";
import OrderNotification from "./notification/OrderNotification";
import RestockNotification from "./notification/RestockNotification";
import noImage from "../../assets/images/distributor/account.png";
import retailerLogo from "../../assets/images/retailer/retailerLogo01.png";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  decrement,
  increment,
  set,
} from "../../redux/slices/retailer/itemsQuantitySlice";
import {
  get_search,
  get_search_category,
} from "../../redux/services/retailer/search.service";
import {
  getSearchCategory,
  getSearchStore,
  setError,
  setLoading,
} from "../../redux/slices/retailer/searchSlice";
import SearchingRetailer from "./SearchingRetailer";
import { get_retailer_profile } from "../../redux/services/retailer/retailerProfile.service";
import { getRetailerInfo } from "../../redux/slices/retailer/retailerProfileSlice";
import {
  add_product_to_cart,
  cancel_order_from_cart,
  confirm_order_from_cart,
  delete_product_in_cart,
  get_all_cart,
  get_all_product_in_cart,
  save_to_draft,
  view_product_in_cart,
} from "../../redux/services/retailer/retailerHomepage.service";
import {
  AddProductToCart,
  cancelProductInCart,
  checkoutProduct,
  deleteProductInCart,
  draftStore2,
  getOrderInCart,
  getProductInCart,
  setStoreId,
} from "../../redux/slices/retailer/homepageSlice/allShopSlice";
import {
  get_all_notification_retailer,
  mark_read_all_notification_retailer,
} from "../../redux/services/retailer/notificationRetailer.service";
import {
  getAllNotificationRetailers,
  setReadAllNotificationsRetailer,
} from "../../redux/slices/retailer/notification/notificationRetailerSlice";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import DeliveringNotification from "./notification/DeliveringNotificaiton";
import ConfirmingNotification from "./notification/ConfirmingNotification";
import RejectNotification from "./notification/RejectNotification";
import { over } from "stompjs";
import SockJS from "sockjs-client";
import {
  Search,
  Bell,
  ShoppingBag,
  User,
  LogOut,
  Trash2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../modern/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { sendOneSignalNotification } from "@/lib/notifications/send-onesignal-client";
export default function NavBarRetailerComponent() {
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [success, setSuccess] = useState(false);
  const [success2, setSuccess2] = useState(false);
  const [confOrder, setConfOrder] = useState(false);
  // useEffect(()=>{
  //   get_report().then(r=>console.log(r.data.data))
  // },[]);
  const SearchList = useSelector((state) => state.search.item);
  const dispatch = useDispatch();
  //2. then we create state too store what user input
  const [onChangeSearch, setOnChangeSearch] = useState("");

  const searchProductByStore = () => {
    setLoadingSearch(true);
    if (onChangeSearch === "" || onChangeSearch === null) {
      toast.warn("Please input something in search bar");
    } else {
      get_search(onChangeSearch, dispatch)
        .then((e) => {
          // console.log("data : ",e.data)
          // console.log(e.response.status)
          if (e.status === 401) {
            dispatch(setError(true));
            dispatch(setLoading(false));
          }
          if (e.status === 200) {
            dispatch(getSearchStore(e.data.data));
            dispatch(setLoading(false));
            dispatch(setError(false));
          }
          if (e.status === 404) {
            dispatch(getSearchStore(""));
            dispatch(setLoading(false));
            dispatch(setError(false));
          }
        })
        .catch((err) => {
          dispatch(setLoading(false));
        });
      router.push("/retailer/searching-shop");
      // navigate("/retailer/skeleton-search")
    }
  };

  //1. onchange function use to catch user input
  const handleFormChange = (e) => {
    const data = e.target.value;
    // console.log(data)

    setOnChangeSearch(data);
  };
  const handleClearSearch = () => {
    setOnChangeSearch("");
  };

  const router = useRouter();
  const pathname = usePathname();
  const [toggleState, setToggleState] = useState(1);
  const toggleTab = (index) => {
    setToggleState(index);
  };
  const toggleTab1 = () => {
    toggleTab(1);
  };
  const toggleTab2 = () => {
    toggleTab(2);
  };
  const toggleTab3 = () => {
    toggleTab(3);
  };
  const toggleTab4 = () => {
    toggleTab(4);
  };
  const toggleTab5 = () => {
    toggleTab(5);
  };

  const onSignOut = () => {
    localStorage.clear();
    router.push("/");
  };
  const itemsCounter = useSelector((state) => state.itemsCounter);
  const searchParams = useSearchParams();
  const id = searchParams.get("storeId");
  // console.log("id ahahahahahahah ", id)

  const { storeId } = useSelector((state) => state.getDataAllShop);

  const [draf, setDraft] = useState(false);

  const [cart, setCart] = useState([]); // Initialize cart state
  const [productCart, setPorductCart] = useState([]); // Initialize product cart state

  useEffect(() => {
    get_all_product_in_cart()
      .then((response) => {
        const cartData = response?.data?.data ?? {};
        dispatch(getProductInCart(cartData.products ?? []));
        dispatch(getOrderInCart(cartData.order ?? []));
      })
      .catch(() => {
        dispatch(getProductInCart([]));
        dispatch(getOrderInCart([]));
      });
  }, []);

  // useEffect(()=> {
  //   get_all_product_in_cart().then((e) => dispatch(getOrderInCart(e.data.data.products)));

  // },[]);
  const { orderInCartData } = useSelector((state) => state.getDataAllShop);
  // console.log("orderInCartData : ",orderInCartData)

  // console.log("productInCartData", productInCartData);
  const counter = useSelector((state) => state.itemsCounter);
  // console.log("hahahahaa",counter)
  const productData = useSelector((state) => state.getDataAllShop.productData);

  useEffect(() => {
    const storedCounter = JSON.parse(localStorage.getItem("counter"));
    if (storedCounter) {
      setCounterLocalStorage(storedCounter);
    }
  }, [localStorage.getItem("counter")]);

  const [disabledButtons, setDisabledButtons] = useState(new Set());
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(new Set()); // Initialize the loading state for products
  const [loadingProducts2, setLoadingProducts2] = useState(new Set()); // for decrement button
  const [counterLocalStorage, setCounterLocalStorage] = useState(
    JSON.parse(localStorage.getItem("counter")) || {}
  );
  const localStoreId = localStorage.getItem("storeIdLocalStorage");
  const localStoreName = localStorage.getItem("storeNameLocalStorage");

  // handleDecrement button-
  const handleDecrement = async (productId) => {
    setDisabledButtons((prevDisabledButtons) => {
      setIsButtonDisabled(false);

      const updatedDisabledButtons = new Set(prevDisabledButtons);
      updatedDisabledButtons.add(productId);
      return updatedDisabledButtons;
    });

    setLoadingProducts2((prevLoadingProducts) =>
      new Set(prevLoadingProducts).add(productId)
    ); // Start loading indicator for the current product

    const currentValue = parseInt(counterLocalStorage[productId] || 0);
    // console.log("gagagag",currentValue);
    if (currentValue === 1) {
      delete_product_in_cart(productId).then(
        dispatch(deleteProductInCart(productId))
      );

      const updatedCounters = { ...counterLocalStorage };
      delete updatedCounters[productId];
      localStorage.setItem("counter", JSON.stringify(updatedCounters));

      // Dispatch the custom event to notify other components about the local storage update
      const localStorageUpdatedEvent = new CustomEvent("localStorageUpdated", {
        detail: updatedCounters,
      });
      window.dispatchEvent(localStorageUpdatedEvent);

      const productNull = productInCartData.length === 1;
      //  console.log("wtf",productNull)
      if (productNull) {
        cancel_order_from_cart();
        // console.log('niceeeeeeeeeee')
      }
    }
    if (currentValue > 0) {
      const product = productInCartData.find(
        (item) => item.productId === productId
      );
      const qty = currentValue - 1;

      if (product) {
        if (product.qty < qty) {
          toast.warn("This product is out of stock");
        } else {
          try {
            const startTime = performance.now(); // Track start time of API call
            const response = await add_product_to_cart(
              localStoreId,
              productId,
              qty
            );
            const endTime = performance.now(); // Track end time of API call
            dispatch(AddProductToCart(response.data.data));

            // decrement the counter
            dispatch(decrement({ productId }));
          } catch (error) {
            // catch (error) {
            //     console.error(error);
            //   // if(error.response.status===500 ){
            //   //   toast.error("hahahahaha .");
            //   // }
            //   // toast.error("You can only have one cart at a time.");
            // }
            if (error.response) {
              const { status, data } = error.response;

              //         if (status === 500) {
              // toast.error("An internal server error occurred.");}
            } else {
              // console.error("error ",error); // Log the error object
              // Handle other types of errors
            }
          }
        }
      } else {
        // decrement the counter
        dispatch(decrement({ productId }));
      }

      const updatedCounters = { ...counterLocalStorage, [productId]: qty };
      setCounterLocalStorage(updatedCounters);
      localStorage.setItem("counter", JSON.stringify(updatedCounters));
      const localStorageUpdatedEvent = new CustomEvent("localStorageUpdated", {
        detail: updatedCounters,
      });
      window.dispatchEvent(localStorageUpdatedEvent);
      // }
    }
    setLoadingProducts2((prevLoadingProducts) => {
      const updatedLoadingProducts = new Set(prevLoadingProducts);
      updatedLoadingProducts.delete(productId);
      return updatedLoadingProducts;
    }); // Stop loading indicator for the current product

    setDisabledButtons((prevDisabledButtons) => {
      const updatedDisabledButtons = new Set(prevDisabledButtons);
      updatedDisabledButtons.delete(productId);
      return updatedDisabledButtons;
    }); // Re-enable the button
  };

  // button handleInputChange
  const [isLoadingInputs, setIsLoadingInputs] = useState(new Set());
  const { productInCartData } = useSelector((state) => state.getDataAllShop);

  const timeoutRef = useRef(null);

  const handleInputChange = async (productId, e) => {
    const value = parseInt(e.target.value);
    const product = productInCartData.find(
      (item) => item.productId === productId
    );

    if (value === 0) {
      delete_product_in_cart(productId).then(
        dispatch(deleteProductInCart(productId))
      );
      const productNull = productInCartData.length === 1;
      if (productNull) {
        cancel_order_from_cart();
      }
    }

    if (isNaN(value)) {
      return null;
    }

    if (value > 0) {
      if (product) {
        if (product.inStock < value) {
          toast.warn("This product is out of stock");
          return;
        }

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
          setIsLoadingInputs((prevLoadingInputs) => {
            const updatedLoadingInputs = new Set(prevLoadingInputs);
            updatedLoadingInputs.add(productId);
            return updatedLoadingInputs;
          });

          const startTime = performance.now();
          const response = await add_product_to_cart(
            localStoreId,
            productId,
            value
          );
          const endTime = performance.now();

          if (response.status === 409) {
            toast.error("Oops, you can only have one cart at a time.");
            setIsLoadingInputs((prevLoadingInputs) => {
              const updatedLoadingInputs = new Set(prevLoadingInputs);
              updatedLoadingInputs.delete(productId);
              return updatedLoadingInputs;
            });
          }

          dispatch(AddProductToCart(response.data.data));
          dispatch(set({ productId, quantity: value }));

          setIsLoadingInputs((prevLoadingInputs) => {
            const updatedLoadingInputs = new Set(prevLoadingInputs);
            updatedLoadingInputs.delete(productId);
            return updatedLoadingInputs;
          });
        }, 1000);
      } else {
        dispatch(set({ productId, quantity: value }));
      }
    }

    const updatedCounters = { ...counterLocalStorage, [productId]: value };
    setCounterLocalStorage(updatedCounters);
    localStorage.setItem("counter", JSON.stringify(updatedCounters));
    const localStorageUpdatedEvent = new CustomEvent("localStorageUpdated", {
      detail: updatedCounters,
    });
    window.dispatchEvent(localStorageUpdatedEvent);
  };

  const handleIncrement = async (productId) => {
    const product = productInCartData.find(
      (item) => item.productId === productId
    );

    setDisabledButtons((prevDisabledButtons) => {
      const updatedDisabledButtons = new Set(prevDisabledButtons);
      updatedDisabledButtons.add(productId);
      return updatedDisabledButtons;
    });

    setLoadingProducts((prevLoadingProducts) =>
      new Set(prevLoadingProducts).add(productId)
    ); // Start loading indicator for the current product

    const currentValue = parseInt(counterLocalStorage[productId] || 0);
    const qty = currentValue + 1;

    if (product) {
      const startTime = performance.now(); // Track start time of API call
      const response = await add_product_to_cart(localStoreId, productId, qty);
      const endTime = performance.now(); // Track end time of API call
      // console.log("localStoreId", localStoreId, productId, qty);
      const apiTime = endTime - startTime;

      // check all error here
      // if()
      if (response.status === 401) {
        toast.error("Opps, something went wrong please try again.");
        setLoadingProducts((prevLoadingProducts) => {
          const updatedLoadingProducts = new Set(prevLoadingProducts);
          updatedLoadingProducts.delete(productId);
          return updatedLoadingProducts;
        });
      }
      if (apiTime > 10000) {
        toast.error("Opps, connection unstable please try again.");
      }
      if (
        response.data.detail === "Not enough product in stock. Fail on count: 1"
      ) {
        toast.warning("Opps, this product is running out of stock.");
        setLoadingProducts((prevLoadingProducts) => {
          const updatedLoadingProducts = new Set(prevLoadingProducts);
          updatedLoadingProducts.delete(productId);
          return updatedLoadingProducts;
        });
      }
      if (
        response.data.detail ===
        "One cart is processing. Can only order once at a time. Please kindly wait for this order to be accepted."
      ) {
        toast.error("Opps, you can only have one cart at a time.");
        setLoadingProducts((prevLoadingProducts) => {
          const updatedLoadingProducts = new Set(prevLoadingProducts);
          updatedLoadingProducts.delete(productId);
          return updatedLoadingProducts;
        });
      }
      if (
        response.data.detail ===
        "User have no profile. Please setup user profile to make order."
      ) {
        toast.error(
          "Opps, you have no profile. Please setup user profile to make order."
        );
        setLoadingProducts((prevLoadingProducts) => {
          const updatedLoadingProducts = new Set(prevLoadingProducts);
          updatedLoadingProducts.delete(productId);
          return updatedLoadingProducts;
        });
      }
      dispatch(AddProductToCart(response.data.data));

      // Increment the counter
      dispatch(increment({ productId }));
      setIsButtonDisabled(false);
    } else {
      // Increment the counter
      dispatch(increment({ productId }));
    }

    setLoadingProducts((prevLoadingProducts) => {
      const updatedLoadingProducts = new Set(prevLoadingProducts);
      updatedLoadingProducts.delete(productId);
      return updatedLoadingProducts;
    }); // Stop loading indicator for the current product

    setDisabledButtons((prevDisabledButtons) => {
      const updatedDisabledButtons = new Set(prevDisabledButtons);
      updatedDisabledButtons.delete(productId);
      return updatedDisabledButtons;
    }); // Re-enable the button

    const updatedCounters = { ...counterLocalStorage, [productId]: qty };
    // if(updatedCounters>=0){
    setCounterLocalStorage(updatedCounters);
    localStorage.setItem("counter", JSON.stringify(updatedCounters));
    const localStorageUpdatedEvent = new CustomEvent("localStorageUpdated", {
      detail: updatedCounters,
    });
    window.dispatchEvent(localStorageUpdatedEvent);
  };

  // onClickDeleteProductInCart
  const onClickDeleteProductInCart = (productId) => {
    delete_product_in_cart(productId).then(
      dispatch(deleteProductInCart(productId))
    );

    const updatedCounters = { ...counterLocalStorage };
    delete updatedCounters[productId];
    localStorage.setItem("counter", JSON.stringify(updatedCounters));

    // Dispatch the custom event to notify other components about the local storage update
    const localStorageUpdatedEvent = new CustomEvent("localStorageUpdated", {
      detail: updatedCounters,
    });
    window.dispatchEvent(localStorageUpdatedEvent);

    const productNull = productInCartData.length === 1;

    if (productNull) {
      localStorage.removeItem("storeIdLocalStorage");
      localStorage.removeItem("storeNameLocalStorage");

      cancel_order_from_cart();
    }
  };

  const handleClickCheckOut = (option) => {
    // confirm_order_from_cart().then((e)=> dispatch(checkoutProduct(e.data.data)))
    const message = "You have new order...!";
    if (option === "yes") {
      confirm_order_from_cart()
        .then(async (response) => {
          // console.log("message from add to cart:", response.data.data.userId);
          // =========== push notification ==============
          const notification = {
            contents: { en: message },
            include_external_user_ids: [response.data.data.userId.toString()],
          };
          try {
            const notificationResponse = await sendOneSignalNotification(notification);
          } catch (error) {
          }
          dispatch(checkoutProduct(response.data));
        })
        .catch((error) => {
          // Handle the error if needed
        });
      // remove data from local storage

      localStorage.removeItem("storeNameLocalStorage");

      const updatedCounters = { ...counterLocalStorage };
      localStorage.removeItem("storeIdLocalStorage");

      for (let key in updatedCounters) {
        delete updatedCounters[key];
      }
      // delete updatedCounters;
      localStorage.setItem("counter", JSON.stringify(updatedCounters));

      // Dispatch the custom event to notify other components about the local storage update
      const localStorageUpdatedEvent = new CustomEvent("localStorageUpdated", {
        detail: updatedCounters,
      });
      window.dispatchEvent(localStorageUpdatedEvent);
      setSuccess(!success);
    } else if (option === "no") {
      setSuccess(!success);
    }
  };

  const handleClickCancel = (option) => {
    if (option === "yes") {
      cancel_order_from_cart().then((e) =>
        dispatch(cancelProductInCart(e.data))
      );
      // remove data from local storage
      localStorage.removeItem("storeIdLocalStorage");
      localStorage.removeItem("storeNameLocalStorage");

      const updatedCounters = { ...counterLocalStorage };

      for (let key in updatedCounters) {
        delete updatedCounters[key];
      }
      // delete updatedCounters;
      localStorage.setItem("counter", JSON.stringify(updatedCounters));

      // Dispatch the custom event to notify other components about the local storage update
      const localStorageUpdatedEvent = new CustomEvent("localStorageUpdated", {
        detail: updatedCounters,
      });
      window.dispatchEvent(localStorageUpdatedEvent);
      setDraft(!draf);
    } else if (option === "no") {
      setDraft(!draf);
    }
  };

  const draftStore = (option) => {
    if (option === "yes") {
      save_to_draft().then((e) => dispatch(draftStore2(e.data)));
      // remove data from local storage

      localStorage.removeItem("storeNameLocalStorage");
      const updatedCounters = { ...counterLocalStorage };
      localStorage.removeItem("storeIdLocalStorage");

      for (let key in updatedCounters) {
        delete updatedCounters[key];
      }
      // delete updatedCounters;
      localStorage.setItem("counter", JSON.stringify(updatedCounters));

      // Dispatch the custom event to notify other components about the local storage update
      const localStorageUpdatedEvent = new CustomEvent("localStorageUpdated", {
        detail: updatedCounters,
      });
      window.dispatchEvent(localStorageUpdatedEvent);
      setSuccess2(!success2);
    } else if (option === "no") {
      setSuccess2(!success2);
    }
  };

  // ================== account =================
  useEffect(() => {
    get_retailer_profile().then((res) => {
      if (!res || res.status === 404) {
        dispatch(
          getRetailerInfo({
            id: null,
            retailerAccountId: null,
            firstName: "unknown",
            lastName: "guest",
            gender: "unknown",
            address: "unknown",
            primaryPhoneNumber: "0XXXXXXXX",
            profileImage:
              "https://firebasestorage.googleapis.com/v0/b/wm-file-upload.appspot.com/o/download.png?alt=media&token=f3aa8608-77b4-4437-af13-993de6ac2e84",
            createdDate: null,
            updatedDate: null,
            additionalPhoneNumber: null,
          })
        );
      }
      if (res?.status === 200) {
        dispatch(getRetailerInfo(res.data.data));
      }
    });
  }, []);
  const profile = useSelector((state) => state.retailerProfile.retailerInfo);

  const dropdownRef = useRef(null);

  const handleBackButtonClick = () => {
    const dropdownElement = dropdownRef.current;
    if (dropdownElement) {
      dropdownElement.classList.remove("open");
    }
  };

  //=================================================== Handle all notifications ==========================================
  const [noDataNotifications, setDataNotifications] = useState(false);
  // ===================== websocket =================
  var stompClient = null;
  const Sock = null;
  const connect = () => {
    const Sock = new SockJS(`${process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8888"}/ws`);
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };
  const disconnectFromSocket = () => {
    if (Sock) {
      Sock.close();
    }
  };
  const onConnected = () => {
    stompClient.subscribe(
      "/user/" + localStorage.getItem("userId") + "/private",
      onPrivateMessage
    );
    userJoin();
  };
  const userJoin = () => {
    var chatMessage = {
      status: "JOIN",
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };
  const onPrivateMessage = (payload) => {
    var payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
      case "ORDER":
        get_all_notification_retailer().then((res) => {
          if (res.status === 200) {
            dispatch(getAllNotificationRetailers(res.data.data));
            setDataNotifications(false);
          } else {
            setDataNotifications(true);
          }
        });
        break;
    }
  };
  const onError = (err) => {
  };
  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    get_all_notification_retailer().then((res) => {
      if (res?.status === 200) {
        dispatch(getAllNotificationRetailers(res.data.data));
        setDataNotifications(false);
      } else {
        setDataNotifications(true);
      }
    });
  }, [dispatch]);
  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      right: -9,
      top: 5,
      border: `1px solid ${theme.palette.background.paper}`,
      padding: "0 1px",
      background: "#F15B22",
    },
  }));
  const allDataNotificationRetailer = useSelector(
    (state) => state.DataNotificationRetailer.dataNotificationRetailer
  );
  //                ====== count notifications ======

  const countAllNotificationUnseen = allDataNotificationRetailer.filter(
    (item) => item.seen === false
  ).length;
  // console.log("first notification", countAllNotificationUnseen);
  //                ====== count notifications ORDER_ACCEPTED======

  const countAllNotificationUnseenOrderAccepted =
    allDataNotificationRetailer.filter(
      (item) =>
        item.notificationType === "ORDER_ACCEPTED" && item.seen === false
    ).length;
  //                ====== count notifications ORDER_DELIVERING======

  const countAllNotificationUnseenOrderDelivering =
    allDataNotificationRetailer.filter(
      (item) =>
        item.notificationType === "ORDER_DELIVERING" && item.seen === false
    ).length;
  //                ====== count notifications ORDER_CONFIRMING======

  const countAllNotificationUnseenOrderConfirming =
    allDataNotificationRetailer.filter(
      (item) =>
        item.notificationType === "ORDER_CONFIRMING" && item.seen === false
    ).length;
  //                ====== count notifications ORDER_REJECTED======

  const countAllNotificationUnseenOrderRejected =
    allDataNotificationRetailer.filter(
      (item) =>
        item.notificationType === "ORDER_REJECTED" && item.seen === false
    ).length;

  //    ================== mark read all notifications =================
  const [showModalReadAllNotifications, setShowModalReadAllNotifications] =
    useState(false);
  const handleReadAllNotifications = () => {
    mark_read_all_notification_retailer().then((res) => {
      if (res.status === 200) {
        dispatch(setReadAllNotificationsRetailer());
      }
      if (res.status === 401) {
      }
    });
  };

  const onClickGetDataShop = (id, storeName) => {
    // get_store_by_id(id).then((e) => dispatch(getShopById(e.data.data)));

    // get_all_product_by_storeId(id).then((e) =>
    //   dispatch(getAllProductByStoreId(e.data.data))
    // );
    // get_all_category_by_storeId(id).then((e)=> dispatch(getAllCategoryByStoreId(e.data.data)));
    // // const storeId= id;
    dispatch(setStoreId(id));

    dispatch(setStoreId(id)); // Dispatch the setStoreId action
    router.push(`/retailer/distributor-shop?storeId=${id}&storeName=${encodeURIComponent(storeName)}`);

    // navigate(`/retailer/distributor-shop/${id}`);
    window.scrollTo(0, 0);
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md transition-all  ">
      <div className="mx-auto flex h-20 max-w-[105rem] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand/Logo */}
        <Link
          href="/retailer/home"
          onClick={handleClearSearch}
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-orange-100 p-0.5  sm:h-12 sm:w-12">
            <img
              src={retailerLogo.src || retailerLogo}
              alt="StockFlow Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="hidden text-xl font-black tracking-tight text-slate-900  sm:block">
            StockFlow
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden max-w-2xl flex-1 px-8 lg:block">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-slate-400" />
            <input
              type="text"
              onChange={handleFormChange}
              onKeyDown={(event) => event.key === "Enter" && searchProductByStore()}
              value={onChangeSearch}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-24 text-sm transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10     "
              placeholder="Search products, stores..."
            />
            <button
              onClick={searchProductByStore}
              className="absolute right-1.5 rounded-xl bg-orange-500 px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-orange-600 active:scale-95"
            >
              Search
            </button>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-orange-500    ">
                <Bell className="h-5 w-5" />
                {countAllNotificationUnseen > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white ">
                    {countAllNotificationUnseen > 99 ? "99+" : countAllNotificationUnseen}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(28rem,95vw)] overflow-hidden rounded-2xl p-0 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4  ">
                <h3 className="text-sm font-bold text-slate-900 ">Notifications</h3>
                <button
                  onClick={handleReadAllNotifications}
                  className="text-xs font-semibold text-orange-500 transition hover:text-orange-600"
                >
                  Mark all read
                </button>
              </div>

              <div className="border-b border-slate-100 bg-white px-2  ">
                <div className="flex gap-1 overflow-x-auto p-2 scrollbar-hide">
                  {[
                    { id: 1, label: "All", count: countAllNotificationUnseen },
                    { id: 2, label: "Accepted", count: countAllNotificationUnseenOrderAccepted },
                    { id: 3, label: "Shipping", count: countAllNotificationUnseenOrderDelivering },
                    { id: 4, label: "Confirming", count: countAllNotificationUnseenOrderConfirming },
                    { id: 5, label: "Rejected", count: countAllNotificationUnseenOrderRejected },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => toggleTab(tab.id)}
                      className={`relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        toggleState === tab.id
                          ? "bg-orange-50 text-orange-600  "
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700   "
                      }`}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`h-1.5 w-1.5 rounded-full ${toggleState === tab.id ? "bg-orange-500" : "bg-slate-300 "}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[32rem] overflow-y-auto scrollbar-thin">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={toggleState}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {toggleState === 1 && <AllNotification />}
                    {toggleState === 2 && <OrderNotification />}
                    {toggleState === 3 && <DeliveringNotification />}
                    {toggleState === 4 && <ConfirmingNotification />}
                    {toggleState === 5 && <RejectNotification />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Shopping Cart */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-orange-500    ">
                <ShoppingBag className="h-5 w-5" />
                {productInCartData.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white ">
                    {productInCartData.reduce((sum, item) => sum + item.qty, 0)}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(32rem,95vw)] overflow-hidden rounded-2xl p-0 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4  ">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 ">Your Cart</h3>
                  {productInCartData.length > 0 && (
                    <p className="text-[10px] font-medium text-slate-500">
                      Order from <span className="text-orange-500">{localStoreName}</span>
                    </p>
                  )}
                </div>
                {productInCartData.length > 0 && (
                  <button
                    onClick={() => setSuccess2(!success2)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 transition hover:border-orange-200 hover:text-orange-500   "
                  >
                    <Package className="h-3 w-3" />
                    Save Draft
                  </button>
                )}
              </div>

              <div className="max-h-[28rem] overflow-y-auto scrollbar-thin">
                {productInCartData.length > 0 ? (
                  <div className="divide-y divide-slate-50 ">
                    {productInCartData.map((item) => (
                      <div key={item.productId} className="group flex items-center gap-4 p-4 transition-colors hover:bg-slate-50/50 ">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white  ">
                          <img
                            src={getSafeImageSrc(item.image, noImage)}
                            onError={(e) => applyImageFallback(e, noImage)}
                            alt={item.productName}
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <h4 className="line-clamp-1 text-xs font-bold text-slate-900 ">{item.productName}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">${item.unitPrice}</span>
                            <span className="text-[10px] text-slate-300">/ pack</span>
                          </div>
                          
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1  ">
                              <button
                                onClick={() => handleDecrement(item.productId)}
                                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-orange-500 "
                              >
                                {loadingProducts2.has(item.productId) ? (
                                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-3 w-3 border-2 border-orange-500 border-t-transparent rounded-full" />
                                ) : (
                                  <Minus className="h-3 w-3" />
                                )}
                              </button>
                              <input
                                type="text"
                                value={counterLocalStorage[item.productId] || 0}
                                onChange={(e) => handleInputChange(item.productId, e)}
                                className="w-8 bg-transparent text-center text-xs font-bold text-slate-900 focus:outline-none "
                              />
                              <button
                                onClick={() => handleIncrement(item.productId)}
                                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-orange-500 "
                              >
                                {loadingProducts.has(item.productId) ? (
                                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-3 w-3 border-2 border-orange-500 border-t-transparent rounded-full" />
                                ) : (
                                  <Plus className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <span className="text-sm font-black text-slate-900 ">${item.subTotal.toFixed(2)}</span>
                          <button
                            onClick={() => onClickDeleteProductInCart(item.productId)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500  "
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <div className="rounded-full bg-slate-50 p-6 ">
                      <ShoppingBag className="h-10 w-10 text-slate-200 " />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 ">Empty Cart</h4>
                      <p className="text-xs text-slate-500">Your shopping cart is waiting to be filled.</p>
                    </div>
                  </div>
                )}
              </div>

              {productInCartData.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-5  ">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Subtotal</span>
                    <span className="text-lg font-black text-slate-900 ">
                      ${productInCartData.reduce((sum, item) => sum + item.subTotal, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setSuccess(!success)}
                      className="flex-1 h-11 rounded-xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98]"
                    >
                      Checkout
                    </Button>
                    <Button
                      onClick={() => setDraft(!draf)}
                      variant="secondary"
                      className="flex-1 h-11 rounded-xl font-bold text-slate-700 active:scale-[0.98]"
                    >
                      Cancel Order
                    </Button>
                  </div>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 p-0 overflow-hidden rounded-xl border-2 border-white bg-slate-100 shadow-sm transition-transform active:scale-95">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 overflow-hidden rounded-2xl p-0 shadow-2xl">
              <div className="bg-slate-50/50 p-4 ">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account</p>
                <p className="line-clamp-1 text-sm font-bold text-slate-900 ">
                  {profile.firstName} {profile.lastName}
                </p>
              </div>
              <div className="p-1.5">
                <DropdownMenuItem asChild>
                  <Link
                    href="/retailer/profile"
                    onClick={handleClearSearch}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-orange-500 focus:bg-slate-50 focus:text-orange-500   "
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 " />
                <DropdownMenuItem
                  onClick={onSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 "
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden   "
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mini Navbar - Desktop Navigation */}
      <nav className="hidden border-t border-slate-100 bg-white   lg:block">
        <div className="mx-auto flex h-12 max-w-[105rem] items-center justify-center gap-8 px-8">
          {[
            { href: "/retailer/home", label: "Home" },
            { href: "/retailer/order", label: "Order" },
            { href: "/retailer/favorite", label: "Favorite" },
            { href: "/retailer/report", label: "Report" },
            { href: "/retailer/draft", label: "Draft" },
            { href: "/retailer/order-history", label: "Order History" },
          ].map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleClearSearch}
                className={`group relative text-sm font-bold transition-colors ${
                  isActive ? "text-orange-500" : "text-slate-500 hover:text-slate-900  "
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-retailer"
                    className="absolute -bottom-[17px] left-0 h-0.5 w-full bg-orange-500"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu - Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xs border-l border-slate-200 bg-white shadow-2xl   lg:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6">
                  <span className="text-lg font-black text-slate-900 ">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 "
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Search */}
                <div className="px-6 pb-4">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      onChange={handleFormChange}
                      onKeyDown={(event) => event.key === "Enter" && searchProductByStore()}
                      value={onChangeSearch}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2 pl-10 pr-4 text-xs  "
                      placeholder="Search..."
                    />
                  </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                  {[
                    { href: "/retailer/home", label: "Home" },
                    { href: "/retailer/order", label: "Order" },
                    { href: "/retailer/favorite", label: "Favorite" },
                    { href: "/retailer/report", label: "Report" },
                    { href: "/retailer/draft", label: "Draft" },
                    { href: "/retailer/order-history", label: "Order History" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        handleClearSearch();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                        pathname === link.href
                          ? "bg-orange-50 text-orange-600  "
                          : "text-slate-600 hover:bg-slate-50  "
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="p-6 border-t border-slate-100 ">
                  <button
                    onClick={onSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100  "
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Dialogs */}
      <Dialog open={draf} onOpenChange={(open) => !open && setDraft(!draf)}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 ">
              <XCircle className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 ">Cancel Order?</h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => handleClickCancel("yes")}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white transition hover:bg-red-600 active:scale-[0.98]"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => handleClickCancel("no")}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200 active:scale-[0.98]   "
              >
                No, Go Back
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={success} onOpenChange={(open) => !open && setSuccess(!success)}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500 ">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 ">Confirm Order</h3>
            <p className="mt-2 text-sm text-slate-500">
              Ready to place your order with <span className="text-orange-500 font-bold">{localStoreName}</span>?
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => handleClickCheckOut("yes")}
                className="flex-1 rounded-xl bg-green-500 py-3 text-sm font-bold text-white transition hover:bg-green-600 active:scale-[0.98]"
              >
                Yes, Confirm
              </button>
              <button
                onClick={() => handleClickCheckOut("no")}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200 active:scale-[0.98]   "
              >
                Not Now
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={success2} onOpenChange={(open) => !open && setSuccess2(!success2)}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500 ">
              <Package className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 ">Save as Draft</h3>
            <p className="mt-2 text-sm text-slate-500">
              Save your current cart to finish it later?
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => draftStore("yes")}
                className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white transition hover:bg-orange-600 active:scale-[0.98]"
              >
                Yes, Save Draft
              </button>
              <button
                onClick={() => draftStore("no")}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200 active:scale-[0.98]   "
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confOrder} onOpenChange={(open) => !open && setConfOrder(!confOrder)}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-500 ">
              <Clock className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 ">Ongoing Order</h3>
            <p className="mt-2 text-sm text-slate-500">
              Please checkout your previous order before starting a new one.
            </p>
            <div className="mt-8">
              <button
                onClick={() => setConfOrder(!confOrder)}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98]  "
              >
                Got it
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
