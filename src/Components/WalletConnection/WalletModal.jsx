import React from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import { useConnect } from "wagmi";

function WalletModal(props) {
  const { connect, connectors } = useConnect();
  const { isOpen, handleClose } = props;

  return (
    <Modal show={isOpen} onHide={handleClose}>
      <Modal.Body>
        <Row>
          {connectors.map((connector) => (
            <Col key={connector.name} className="text-center p-2" sm={3} md={6}>
              <Button
                className="border-0"
                variant="transparent"
                disabled={!connector.ready}
                onClick={() => connect({ connector })}
              >
                <Image
                  fluid
                  src={`${connector.name}.png`}
                  height={100}
                  width={100}
                />
                <br />
                <span>{connector.name}</span>
              </Button>
            </Col>
          ))}
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default WalletModal;
