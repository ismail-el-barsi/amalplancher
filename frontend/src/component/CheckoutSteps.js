import React from "react";
import { RiUserLine, RiTruckLine } from "react-icons/ri";
import { FaCreditCard, FaCheckCircle } from "react-icons/fa";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function CheckoutSteps(props) {
  return (
    <Row className="checkout-steps">
      <Col className={props.step1 ? "active" : ""}>
        <div className="step-container">
          <RiUserLine className="checkout-icon" />
          <span>Sign-In</span>
        </div>
      </Col>
      <Col className={props.step2 ? "active" : ""}>
        <div className="step-container">
          <RiTruckLine className="checkout-icon" />
          <span>Shipping</span>
        </div>
      </Col>
      <Col className={props.step3 ? "active" : ""}>
        <div className="step-container">
          <FaCreditCard className="checkout-icon" />
          <span>Payment</span>
        </div>
      </Col>
      <Col className={props.step4 ? "active" : ""}>
        <div className="step-container">
          <FaCheckCircle className="checkout-icon" />
          <span>Place Order</span>
        </div>
      </Col>
    </Row>
  );
}
