import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DuplicatedProduct = ({
  products,
  updateStockForProduct,
  removeNewProduct,
  index,
}) => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [action, setAction] = useState("");
  const [isRadioSelected, setIsRadioSelected] = useState(false);
  const [actionDate, setActionDate] = useState("");

  const clearFormFields = () => {
    setSelectedProduct("");
    setQuantity(0);
    setAction("");
    setIsRadioSelected(false);
    setActionDate("");
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !isRadioSelected) {
      toast.error("Please select a product and an action.");
      return;
    }

    try {
      await updateStockForProduct(
        selectedProduct,
        quantity,
        action,
        actionDate
      );
      clearFormFields();
      toast.success("Stock updated successfully!");
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("An error occurred while updating stock.");
    }
  };

  return (
    <div className="mb-3">
      <h3>new product #{index}</h3>
      <div className="mb-3">
        <label htmlFor={`newProductComboBox${index}`} className="form-label">
          Select Product:
        </label>
        <select
          className="form-select"
          id={`newProductComboBox${index}`}
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Select a product...</option>
          {products.map((product) => (
            <option key={product._id} value={product.name}>
              {product.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor={`newDateInput${index}`} className="form-label">
          Select Date: {/* Label for the date input */}
        </label>
        <input
          type="date"
          className="form-control"
          id={`newDateInput${index}`}
          value={actionDate}
          onChange={(e) => setActionDate(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor={`newQuantityInput${index}`} className="form-label">
          Enter Quantity:
        </label>
        <input
          type="number"
          className="form-control"
          id={`newQuantityInput${index}`}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <div className="mt-2">
          <label className="form-check-label me-3">
            <input
              type="radio"
              className="form-check-input"
              name={`newActionRadio${index}`}
              value="achat"
              checked={action === "achat"}
              onChange={() => {
                setAction("achat");
                setIsRadioSelected(true);
              }}
            />{" "}
            Achat
          </label>
          <label className="form-check-label">
            <input
              type="radio"
              className="form-check-input"
              name={`newActionRadio${index}`}
              value="vente"
              checked={action === "vente"}
              onChange={() => {
                setAction("vente");
                setIsRadioSelected(true);
              }}
            />{" "}
            Vente
          </label>
        </div>
        <button
          className="btn btn-danger mt-2"
          onClick={() => removeNewProduct(index)}
        >
          Remove Product
        </button>
        <button
          className="btn btn-primary mt-2 ms-2"
          onClick={handleUpdateStock}
          disabled={!isRadioSelected}
        >
          Update Stock
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [action, setAction] = useState("");
  const [isRadioSelected, setIsRadioSelected] = useState(false);
  const [actionDate, setActionDate] = useState("");
  const [newProductIndex, setNewProductIndex] = useState(1);
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const updateStockForProduct = async (
    productName,
    updatedQuantity,
    updatedAction,
    updatedDate,
    quantityInBatch
  ) => {
    const selectedProductObject = products.find(
      (product) => product.name === productName
    );

    if (!selectedProductObject) {
      return;
    }

    const adjustedQuantity = parseInt(updatedQuantity);

    if (
      updatedAction === "vente" &&
      adjustedQuantity > selectedProductObject.countInStock
    ) {
      toast.error("Quantity exceeds available stock.");
      return;
    }

    try {
      const response = await fetch(
        `/api/products/updateQuantity2/${selectedProductObject._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: adjustedQuantity,
            action: updatedAction,
            manufacturingDate: updatedDate,
            quantityInBatch: adjustedQuantity,
          }),
        }
      );

      if (!response.ok) {
        console.error("Error updating stock:", response.statusText);
        throw new Error("Error updating stock.");
      }

      fetchProducts();
      clearFormFields();
      toast.success("Stock updated successfully!");
    } catch (error) {
      throw error;
    }
  };

  const clearFormFields = () => {
    setSelectedProduct("");
    setQuantity(0);
    setAction("");
    setIsRadioSelected(false);
  };

  const duplicatePage = () => {
    setNewProductIndex(newProductIndex + 1);
    setNewProducts([...newProducts, { index: newProductIndex }]);
  };

  const removeNewProduct = (indexToRemove) => {
    const updatedNewProducts = newProducts.filter(
      (product) => product.index !== indexToRemove
    );
    setNewProducts(updatedNewProducts);
    setNewProductIndex(newProductIndex - 1);
  };

  return (
    <div className="container mt-5">
      <h1>Stock Management</h1>
      <div className="row">
        <div className="col-md-4">
          <div className="mb-3">
            <label htmlFor="productComboBox" className="form-label">
              Select Product:
            </label>
            <select
              className="form-select"
              id="productComboBox"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Select a product...</option>
              {products.map((product) => (
                <option key={product._id} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-md-8">
          {selectedProduct && (
            <div className="mb-3">
              <label htmlFor="dateInput" className="form-label">
                Select Date:
              </label>
              <input
                type="date"
                className="form-control"
                id="dateInput"
                value={actionDate}
                onChange={(e) => setActionDate(e.target.value)}
              />
              <label htmlFor="quantityInput" className="form-label">
                Enter Quantity:
              </label>
              <input
                type="number"
                className="form-control"
                id="quantityInput"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <div className="mt-2">
                <label className="form-check-label me-3">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="actionRadio"
                    value="achat"
                    checked={action === "achat"}
                    onChange={() => {
                      setAction("achat");
                      setIsRadioSelected(true);
                    }}
                  />{" "}
                  Achat
                </label>
                <label className="form-check-label">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="actionRadio"
                    value="vente"
                    checked={action === "vente"}
                    onChange={() => {
                      setAction("vente");
                      setIsRadioSelected(true);
                    }}
                  />{" "}
                  Vente
                </label>
              </div>
              <button
                className="btn btn-primary mt-2"
                onClick={() =>
                  updateStockForProduct(
                    selectedProduct,
                    quantity,
                    action,
                    actionDate
                  )
                }
                disabled={!isRadioSelected}
              >
                Update Stock
              </button>
            </div>
          )}

          <button className="btn btn-secondary me-2" onClick={duplicatePage}>
            add new product
          </button>
          {newProducts.map((newProduct) => (
            <DuplicatedProduct
              key={newProduct.index}
              index={newProduct.index}
              products={products}
              updateStockForProduct={updateStockForProduct} // Pass the common function here
              removeNewProduct={removeNewProduct}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
