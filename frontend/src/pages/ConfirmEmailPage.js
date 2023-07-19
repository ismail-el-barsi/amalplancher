import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ConfirmEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await axios.get(`/api/users/confirm-email/${token}`);
        // Uncomment the line below to display a success message
        console.log(response.data.message);
        navigate("/login");
      } catch (error) {
        // const errorMessage =
        //   error.response && error.response.data.message
        //     ? error.response.data.message
        //     : "An error occurred while confirming the email.";
        // console.error(errorMessage);
      }
    };

    confirmEmail();
  }, [token, navigate]);

  return <h1>Confirming Email...</h1>;
};

export default ConfirmEmailPage;
