import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import { LinkContainer } from "react-router-bootstrap";
import React, { useContext, useEffect, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Shop } from "./Shop";
import PanierPage from "./pages/PanierPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LivraisonAdressPage from "./pages/LivraisonAdressPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";
import OrderHistoryScreen from "./pages/OrderHistoryPage";
import ProfileScreen from "./pages/ProfilePage";
import Button from "react-bootstrap/Button";
import { getError } from "./Utils";
import axios from "axios";
import SearchBox from "./component/SearchBox";
import SearchScreen from "./pages/SearchPage";
import OrderScreen from "./pages/OrderPage";
import ProtectedRoute from "./component/ProtectedRoute";
import DashboardScreen from "./pages/DashboardPage";
import AdminRoute from "./component/AdminRoute";
import ConducteurRoute from "./component/ConducteurRoute";
import SecretaireRoute from "./component/SecretaireRoute";
import ProductListScreen from "./pages/ProductListPage";
import OrderListScreen from "./pages/OrderListSPage";
import UserListScreen from "./pages/UserListPage";
import UserEditScreen from "./pages/UserEditPage";
import ProductEditScreen from "./pages/ProductEditPage";
import logo from "./logo/logo.png";
import CreateProductPage from "./pages/CreateProductPage ";
import EmployeeListPage from "./pages/EmployeListPage";
import EmployeeEditPage from "./pages/EmployeEditPage";
import CreateEmployeePage from "./pages/CreateEmployePage";
import MapPage from "./pages/MapPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";
import {
  FaChartBar,
  FaBox,
  FaShoppingCart,
  FaUser,
  FaUsersCog,
} from "react-icons/fa";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import ListFacture from "./pages/listFacture";
import CreateInvoicePage from "./pages/CreateFcture";
import EditInvoicePage from "./pages/factureeditpage";
import Viewfacture from "./pages/viewfacture";
function App() {
  const { etat, dispatch: ctxDispatch } = useContext(Shop);
  const { fullBox, panier, userInfo } = etat;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const signoutHandler = () => {
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem("userInfo");
    localStorage.removeItem("paymentMethod");
    window.location.href = "/login";
  };
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const {
    etat: { mode },
    dispatch,
  } = useContext(Shop);

  useEffect(() => {
    document.body.setAttribute("data-bs-theme", mode);
  }, [mode]);

  const switchModeHandler = () => {
    dispatch({ type: "SWITCH_MODE" });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <BrowserRouter>
      <div
        className={
          sidebarIsOpen
            ? fullBox
              ? "site-container active-cont d-flex flex-column full-box"
              : "site-container active-cont d-flex flex-column"
            : fullBox
            ? "site-container d-flex flex-column full-box"
            : "site-container d-flex flex-column"
        }
      >
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Link to="/"></Link>
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              {userInfo && userInfo.isAdmin && windowWidth > 768 && (
                <Button
                  variant="dark"
                  onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
                >
                  <FaUsersCog className="mr-2" /> Admin
                </Button>
              )}

              <LinkContainer to="/">
                <Navbar.Brand>
                  <img
                    src={logo}
                    alt="Amal Plancher Logo"
                    className="logo-img"
                  />
                  Amal Plancher
                </Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                {/* <SearchBox /> */}
                <Nav className="me-auto w-100 justify-content-end">
                  <NavDropdown title="Categories" id="basic-nav-dropdown">
                    {categories.map((category) => (
                      <LinkContainer
                        key={category}
                        to={{
                          pathname: "/search",
                          search: `category=${category}`,
                        }}
                      >
                        <NavDropdown.Item>{category}</NavDropdown.Item>
                      </LinkContainer>
                    ))}
                  </NavDropdown>
                  <Button variant={mode} onClick={switchModeHandler}>
                    <i
                      className={mode === "light" ? "fa fa-sun" : "fa fa-moon"}
                    ></i>
                  </Button>
                  <Link to="/panier" className="nav-link">
                    panier
                    {panier.panierItems.length > 0 && (
                      <Badge pill bg="danger">
                        {panier.panierItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/orderhistory">
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <Link
                        className="dropdown-item"
                        to="#signout"
                        onClick={signoutHandler}
                      >
                        Sign Out
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/login">
                      Sign In
                    </Link>
                  )}
                  {userInfo && userInfo.isAdmin && (
                    <NavDropdown title="Admin" id="admin-nav-dropdown">
                      <LinkContainer to="/admin/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/products">
                        <NavDropdown.Item>Products</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/orders">
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/users">
                        <NavDropdown.Item>Users</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/employees">
                        <NavDropdown.Item>employees</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                  {userInfo && (userInfo.isAdmin || userInfo.isSecretaire) && (
                    <Link to="/admin/factures" className="nav-link">
                      facture
                    </Link>
                  )}
                  {userInfo && userInfo.isConducteur && (
                    <NavDropdown
                      title="conducteur"
                      id="conducteur nav-dropdown"
                    >
                      <LinkContainer to="/conducteur/orders">
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                  {userInfo && userInfo.isSecretaire && (
                    <NavDropdown
                      title="secretaire"
                      id="secretaire nav-dropdown"
                    >
                      <LinkContainer to="/secretaire/orders">
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        <div
          className={
            sidebarIsOpen && userInfo && userInfo.isAdmin && windowWidth > 768
              ? "active-nav side-navbar d-flex justify-content-between flex-wrap flex-column"
              : "side-navbar d-flex justify-content-between flex-wrap flex-column d-none"
          }
        >
          <Nav className="flex-column text-white w-100 p-2">
            <Nav.Item className="mt-auto">
              <div className="text-center">
                <strong>ADMIN MENU</strong>
              </div>
              <LinkContainer to="/admin/dashboard">
                <Nav.Link className="mb-3">
                  <FaChartBar className="mr-2" /> Dashboard
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/admin/products">
                <Nav.Link className="mb-3">
                  <FaBox className="mr-2" /> Products
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/admin/orders">
                <Nav.Link className="mb-3">
                  <FaShoppingCart className="mr-2" /> Orders
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/admin/users">
                <Nav.Link className="mb-3">
                  <FaUsersCog className="mr-2" /> Users
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/admin/employees">
                <Nav.Link className="mb-3">
                  <FaUser className="mr-2" /> Employees
                </Nav.Link>
              </LinkContainer>
            </Nav.Item>
            {/* Add more sidebar menu items here */}
          </Nav>
        </div>

        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route
                path="/livraison"
                element={<LivraisonAdressPage />}
              ></Route>
              <Route path="/" element={<HomePage />} />
              <Route path="/payment" element={<PaymentMethodPage />}></Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/panier" element={<PanierPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/placeorder" element={<PlaceOrderPage />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/forget-password" element={<ForgetPasswordPage />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPasswordPage />}
              />

              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/facture/:id"
                element={
                  <AdminRoute>
                    <EditInvoicePage />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/viewfactures/:id"
                element={
                  <AdminRoute>
                    <Viewfacture />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <OrderListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/confirm-email/:userId"
                element={<ConfirmEmailPage />}
              />
              <Route
                path="/conducteur/orders"
                element={
                  <ConducteurRoute>
                    <OrderListScreen />
                  </ConducteurRoute>
                }
              ></Route>
              <Route
                path="/secretaire/orders"
                element={
                  <SecretaireRoute>
                    <OrderListScreen />
                  </SecretaireRoute>
                }
              ></Route>
              <Route
                path="/admin/employees"
                element={
                  <AdminRoute>
                    <EmployeeListPage />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <ProductListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              ></Route>

              <Route
                path="/orderhistory"
                element={
                  <ProtectedRoute>
                    <OrderHistoryScreen />
                  </ProtectedRoute>
                }
              ></Route>
              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/product/:id"
                element={
                  <AdminRoute>
                    <ProductEditScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/employees/:id"
                element={
                  <AdminRoute>
                    <EmployeeEditPage />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/product/"
                element={
                  <AdminRoute>
                    <CreateProductPage />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/employee/"
                element={
                  <AdminRoute>
                    <CreateEmployeePage />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <MapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/factures"
                element={
                  <ProtectedRoute>
                    <ListFacture />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/facture/"
                element={
                  <AdminRoute>
                    <CreateInvoicePage />
                  </AdminRoute>
                }
              ></Route>
            </Routes>
          </Container>
        </main>
        <footer className="mt-auto bg-light">
          <div className="text-center">all right reserved</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
export default App;
