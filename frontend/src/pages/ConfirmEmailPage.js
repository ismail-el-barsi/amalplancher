import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

const ConfirmEmailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [confirmationCode, setConfirmationCode] = useState("");

  const handleConfirmation = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(`/api/users/confirm-email/${userId}`, {
        confirmationCode,
      });

      if (data.message === "Email confirmed successfully") {
        toast.success(data.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error("Invalid confirmation code");
    }
  };

  return (
    <div>
      <Helmet>
        <title>Email Confirmation</title>
      </Helmet>
      <h1>Confirm Email</h1>
      <form onSubmit={handleConfirmation}>
        <label>Enter the 6-digit code received in your email:</label>
        <input
          type="text"
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
        />
        <button type="submit">Confirm Email</button>
      </form>
    </div>
  );
};

export default ConfirmEmailPage;
