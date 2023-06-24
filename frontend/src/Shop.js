import React from "react";
import { createContext, useReducer } from "react";

export const Shop = createContext();

//create component named shop provider it s a wrapper for a react app
// Wrapper components are components that surround unknown components and provide a default structure to display the child components.
//pass global props to children

//fonction hoc est une technique avancée de React qui permet de réutiliser la logique de composants. Les HOC ne font pas partie de l’API de React à proprement parler,
//mais découlent de sa nature compositionnelle.

export function ShopProvider(props) {
  const etatinitiale = {
    //if page refreshed remeber user that is logged in without lgin in on every refress
    userInfo: localStorage.getItem("userInfo") //check local storage for userinfo
      ? JSON.parse(localStorage.getItem("userInfo")) //if exist use json.parse to convert userinfo string to javascripobject
      : null, //if not make it null

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
  };
  function reducer(etat, action) {
    switch (action.type) {
      //add to panier
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
        localStorage.setItem("panierItems", JSON.stringify(panierItems)); //on refressh ke panier ne se vide pas
        return { ...etat, panier: { ...etat.panier, panierItems } };
      case "PANIER_REMOVE_ITEM": {
        const panierItems = etat.panier.panierItems.filter(
          (item) => item._id !== action.payload._id
        );
        localStorage.setItem("panierItems", JSON.stringify(panierItems));
        return { ...etat, panier: { ...etat.panier, panierItems } };
      }
      case "USER_LOGIN":
        return { ...etat, userInfo: action.payload }; //update userinfi base on data from backend
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
      default:
        return etat;
    }
  }
  const [etat, dispatch] = useReducer(reducer, etatinitiale);
  const value = { etat, dispatch };
  return <Shop.Provider value={value}>{props.children}</Shop.Provider>; //render props.children inside value of shopprovider
}
