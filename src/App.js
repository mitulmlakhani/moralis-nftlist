import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";

import { chains } from "./client";
import WalletModal from "./Components/WalletConnection/WalletModal";

window.Buffer = window.Buffer || require("buffer").Buffer;

function App() {
  const [showModal, setShowModal] = useState(false);
  const { address, connector, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const [nfts, setNfts] = useState([]);
  const [cursor, setCursor] = useState("");
  const [totalNfts, setTotalNfts] = useState(0);

  const fetchTrans = async () => {
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-Key": process.env.REACT_APP_MORALIS_KEY,
      },
    };

    fetch(
      `https://deep-index.moralis.io/api/v2/${address}/nft?chain=${chain.network}&format=decimal&limit=100&cursor=${cursor}`,
      options
    )
      .then((response) => response.json())
      .then((response) => {
        setTotalNfts(response?.total || 0);
        setCursor((response?.cursor ? response.cursor : ""));
        setNfts([...nfts, ...(response?.result || [])]);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (typeof chain === "object" && chain.id !== 56) {
      switchNetwork?.(chains[0]?.id);
    }
  }, [chain]);

  useEffect(() => {
    if (isConnected === true) {
      setShowModal(false);
      fetchTrans();
    } else {
      setNfts([]);
      setCursor("");
    }
  }, [isConnected]);

  useEffect(() => {
    if (
      typeof switchNetwork === "function" &&
      typeof chain === "object" &&
      chain.id !== 56
    ) {
      switchNetwork?.(chains[0]?.id);
    }
  }, [chain]);

  const setHttp = (link) => {
    if (link.search(/^http[s]?\:\/\//) === -1) {
      link = "https://ipfs.io/ipfs/" + link;
    }

    return link;
  };

  return (
    <div className="App d-flex flex-column align-items-center justify-content-center h-100">
      <span className="h1">NFT List</span>

      {!isConnected && (
        <Button
          onClick={() => setShowModal(true)}
          className="mt-2"
          variant="primary"
        >
          Connect
        </Button>
      )}

      {isConnected && (
        <Button variant="danger" onClick={() => disconnect()}>
          Disconnect
        </Button>
      )}

      {isConnected && (
        <>
          <div className="text-center mt-2">
            <div>{address}</div>
            <div>Connected to {connector?.name}</div>
            <div>Chain: {chain?.name}</div>
            <div>Total NFTs: {totalNfts}</div>
          </div>

          <div className="container">
            <ul className="image-gallery">
              {nfts.map((_token) => {
                const metadata = _token?.metadata ? JSON.parse(_token.metadata) : {};
                const imageUrl = setHttp((metadata?.image || "").replace("ipfs://", ""));
                
                return (
                  <li className="m-4">
                    <img
                      src={imageUrl}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = `https://dummyimage.com/250x250/000/fff.png&text=${_token.token_id}`;
                      }}
                      alt={`${_token.name} #${_token.token_id}`}
                    />
                    <div className="overlay text-center">
                      <span>{(metadata?.name || _token.name)} #{_token.token_id}</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {(cursor !== "") && (
              <div style={{display: "flex", justifyContent: "center", margin: "2rem"}}>
                <button onClick={() => fetchTrans()}>Load More</button>
              </div>
            )}
          </div>
        </>
      )}

      <WalletModal isOpen={showModal} handleClose={() => setShowModal(false)} />
    </div>
  );
}

export default App;
