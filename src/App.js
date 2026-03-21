import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import ProtectedRouteRetailer from "./ProtectedRouteRetailer";
import ProtectedRouteDistributor from "./ProtectedRouteDistributor";
import ScrollToTop from "./ScrollToTop";

const Layout = lazy(() => import("./components/Distributor/Layout"));
const SignUpPage = lazy(() => import("./pages/auth/SignUpPage"));
const SignInPage = lazy(() => import("./pages/auth/SignInPage"));
const Landing = lazy(() => import("./pages/auth/Landing"));
const ProductDistributor = lazy(() =>
  import("./pages/distributor/ProductDistributor")
);
const HomeDistributor = lazy(() => import("./pages/distributor/HomeDistributor"));
const Simple = lazy(() => import("./pages/auth/Simple"));
const UpdateProductDistributor = lazy(() =>
  import("./pages/distributor/UpdateProductDistributor")
);
const ReportDistributor = lazy(() =>
  import("./pages/distributor/ReportDistributor")
);
const History = lazy(() => import("./components/Distributor/History"));
const OrderHistory = lazy(() => import("./components/Distributor/OrderHistory"));
const Home = lazy(() => import("./pages/retailer/Home"));
const HomeComponent = lazy(() => import("./pages/retailer/homepage/HomeComponent"));
const Account = lazy(() => import("./pages/distributor/Account"));
const StorePage = lazy(() => import("./pages/distributor/StorePage"));
const NewImport = lazy(() => import("./components/Distributor/NewImport"));
const ReportPageRetailer = lazy(() =>
  import("./pages/retailer/ReportPageRetailer")
);
const OrderPage = lazy(() => import("./components/retailler/OrderPage"));
const AccountRetailer = lazy(() => import("./pages/retailer/AccountRetailer"));
const DistributorStoreRetailer = lazy(() =>
  import("./pages/retailer/DistributorStoreRetailer")
);
const CategoryBeverages = lazy(() =>
  import("./pages/retailer/CategoryBeverages")
);
const Order = lazy(() => import("./components/Distributor/OrderPage/Order"));
const DraftHistory = lazy(() => import("./components/retailler/DraftHistory"));
const OrderHistoryRetail = lazy(() =>
  import("./components/retailler/OrderHistoryRetail")
);
const FavoriteProduct = lazy(() => import("./pages/retailer/FavoriteProduct"));
const NotfoundDistributor = lazy(() =>
  import("./pages/distributor/NotfoundDistributor")
);
const NotFoundRetailer = lazy(() => import("./pages/retailer/NotfoundRetailer"));
const AddProductForm = lazy(() =>
  import("./pages/distributor/TestingDynamicForm")
);
const SearchingRetailer = lazy(() =>
  import("./components/retailler/SearchingRetailer")
);

function App() {
  return (
    <div className="font-Poppins ">
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<ProtectedRouteDistributor />}>
                <Route path="/distributor" element={<Layout />}>
                  <Route path="home" element={<HomeDistributor />} />
                  <Route path="account" element={<Account />} />
                  <Route path="store" element={<StorePage />} />
                  <Route path="category" element={<Simple />} />
                  <Route path="product" element={<ProductDistributor />} />
                  <Route path="add-product" element={<AddProductForm />} />
                  <Route
                    path="update-product"
                    element={<UpdateProductDistributor />}
                  />
                  <Route path="report" element={<ReportDistributor />} />
                  <Route path="order" element={<Order />} />
                  <Route path="order-history" element={<OrderHistory />} />
                  <Route path="history" element={<History />} />
                  <Route path="test" element={<Simple />} />
                  <Route path="*" element={<NotfoundDistributor />} />
                  <Route path="import-product" element={<NewImport />} />
                </Route>
              </Route>
              <Route path="/" element={<ProtectedRouteRetailer />}>
                <Route path="/retailer" element={<Home />}>
                  <Route path="home" element={<HomeComponent />} />
                  <Route path="order" element={<OrderPage />} />
                  <Route path="report" element={<ReportPageRetailer />} />
                  <Route path="profile" element={<AccountRetailer />} />
                  <Route path="beverage" element={<CategoryBeverages />} />
                  <Route path="draft" element={<DraftHistory />} />
                  <Route path="favorite" element={<FavoriteProduct />} />
                  <Route path="order-history" element={<OrderHistoryRetail />} />
                  <Route
                    path="distributor-shop"
                    element={<DistributorStoreRetailer />}
                  />
                  <Route path="searching-shop" element={<SearchingRetailer />} />
                  <Route path="*" element={<NotFoundRetailer />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotfoundDistributor />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </div>
  );
}
export default App;
