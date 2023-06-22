import React from "react";
import Alert from "react-bootstrap/Alert";

export default function MessageBox(accessoires) {
  //set variant to accessoires.variant if variant exist set variant to value that user entered in accessoires otherwise use info as default
  //after renter content inside children of alert
  return (
    <Alert variant={accessoires.variant || "info"}>
      {accessoires.children}
    </Alert>
  );
}
