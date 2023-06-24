import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Shop } from "../Shop";

export default function ConducteurRoute({ children }) {
  const { etat } = useContext(Shop);
  const { userInfo } = etat;
  return userInfo && userInfo.isConducteur ? (
    children
  ) : (
    <Navigate to="/login" />
  );
}
