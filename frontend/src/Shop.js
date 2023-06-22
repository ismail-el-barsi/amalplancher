import React from "react";
import { createContext, useReducer } from "react";

export const Shop = createContext();

const initialetat = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  panier: {
    panierItems: localStorage.getItem("panierItems")
      ? JSON.parse(localStorage.getItem("panierItems"))
      : [],
    livraisonAddress: localStorage.getItem("livraisonAddress")
      ? JSON.parse(localStorage.getItem("livraisonAddress"))
      : {},
    paymentMethod: localStorage.getItem("paymentMethod")
      ? localStorage.getItem("paymentMethod")
      : "",
  },
  employees: [], // Initial employee etat
};

const reducer = (etat, action) => {
  switch (action.type) {
    case "PANIER_ADD_ITEM":
      const newItem = action.payload;
      const existItem = etat.panier.panierItems.find(
        (item) => item._id === newItem._id
      );
      const panierItems = existItem
        ? etat.panier.panierItems.map((item) =>
            item._id === existItem._id ? newItem : item
          )
        : [...etat.panier.panierItems, newItem];
      localStorage.setItem("panierItems", JSON.stringify(panierItems));
      return { ...etat, panier: { ...etat.panier, panierItems } };
    case "PANIER_REMOVE_ITEM":
      const updatedPanierItems = etat.panier.panierItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem("panierItems", JSON.stringify(updatedPanierItems));
      return {
        ...etat,
        panier: { ...etat.panier, panierItems: updatedPanierItems },
      };
    case "USER_LOGIN":
      return { ...etat, userInfo: action.payload };
    case "USER_SIGNOUT":
      return {
        ...etat,
        userInfo: null,
        panier: {
          panierItems: [],
          livraisonAddress: {},
          paymentMethod: "",
        },
      };
    case "SAVE_LIVRAISON_ADDRESS":
      return {
        ...etat,
        panier: {
          ...etat.panier,
          livraisonAddress: action.payload,
        },
      };
    case "SAVE_PAYMENT_METHOD":
      return {
        ...etat,
        panier: { ...etat.panier, paymentMethod: action.payload },
      };
  }
};

export const ShopProvider = (props) => {
  const [etat, dispatch] = useReducer(reducer, initialetat);
  const value = { etat, dispatch };

  return <Shop.Provider value={value}>{props.children}</Shop.Provider>;
};
