import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Shop } from "../Shop";

export default function ProtectedRoute({ children }) {
  const { etat } = useContext(Shop);
  const { userInfo } = etat;
  return userInfo ? children : <Navigate to="/signin" />;
}
