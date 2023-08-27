import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

const ConfirmEmailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [confirmationCode, setConfirmationCode] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(60);

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

  const handleResendCode = async () => {
    setResendDisabled(true);
    setTimer(60);

    try {
      await axios.post(`/api/users/resend-confirmation/${userId}`);
      toast.success("Confirmation code resent");
    } catch (error) {
      toast.error("Error resending confirmation code");
    }
  };

  useEffect(() => {
    if (timer > 0 && resendDisabled) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => {
        clearInterval(countdown);
      };
    } else if (timer === 0) {
      setResendDisabled(false);
    }
  }, [timer, resendDisabled]);

  return (
    <div className="container mt-5">
      <Helmet>
        <title>Email Confirmation</title>
      </Helmet>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title">Confirm Email</h1>
              <form onSubmit={handleConfirmation}>
                <div className="form-group">
                  <label>Enter the 6-digit code received in your email:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    maxLength={6} // Limit input to 6 characters
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Confirm Email
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ml-2"
                  onClick={handleResendCode}
                  disabled={resendDisabled}
                >
                  {resendDisabled ? `Resend in ${timer} sec` : "Resend Code"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
