import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import styles from "../pages/HomePage.module.css"; // Import as CSS module
import NFT from "../pages/NFT.jsx"; // Import NFT component

export default function HomePage() {
    const [ethWallet, setEthWallet] = useState(undefined);
    const [account, setAccount] = useState(undefined);
    const [atm, setATM] = useState(undefined);
    const [balance, setBalance] = useState(undefined);
    const [nfts, setNfts] = useState([
        { id: 1, name: "NFT 1", price: 1, artist: "Artist 1", description: "Description here...", owner: 1 },
        { id: 2, name: "NFT 2", price: 1, artist: "Artist 2", description: "Description here...", owner: 1 },
        { id: 3, name: "NFT 3", price: 1, artist: "Artist 3", description: "Description here...", owner: 1 },
        { id: 4, name: "NFT 4", price: 1, artist: "Artist 4", description: "Description here...", owner: 1 },
        { id: 5, name: "NFT 5", price: 2, artist: "Artist 5", description: "Description here...", owner: 1 },
        { id: 6, name: "NFT 6", price: 1, artist: "Artist 6", description: "Description here...", owner: 1 },
        { id: 7, name: "NFT 7", price: 1, artist: "Artist 7", description: "Description here...", owner: 1 },
    ]);

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const atmABI = atm_abi.abi;

    const getWallet = async () => {
        if (window.ethereum) {
            setEthWallet(window.ethereum);
        }

        if (ethWallet) {
            const account = await ethWallet.request({ method: "eth_accounts" });
            handleAccount(account);
        }
    };

    const handleAccount = (account) => {
        if (account) {
            console.log("Account connected: ", account);
            setAccount(account);
        } else {
            console.log("No account found");
        }
    };

    const connectAccount = async () => {
        if (!ethWallet) {
            alert("MetaMask wallet is required to connect");
            return;
        }

        const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
        handleAccount(accounts);
        getATMContract();
    };

    const getATMContract = () => {
        const provider = new ethers.providers.Web3Provider(ethWallet);
        const signer = provider.getSigner();
        const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
        setATM(atmContract);
    };

    const getBalance = async () => {
        if (atm) {
            setBalance((await atm.getBalance()).toNumber());
        }
    };

    const deposit = async (price, id) => {
        if (atm) {
            let tx = await atm.deposit(price);
            await tx.wait();
    
            // Check if the id is equal to someId before updating the NFTs state
            if (id != 0) {
                // Update the NFTs state to set the owner to 1
                setNfts((prevNfts) =>
                    prevNfts.map((nft) => (nft.id === id ? { ...nft, owner: 1 } : nft))
                );
            }
    
            getBalance();
        }
    };

    const withdraw = async (price, id) => {
        if (atm) {
            // Perform the transaction to buy the NFT
            let tx = await atm.withdraw(price);
            await tx.wait();
            // Update the NFTs state to set the owner to 0
            setNfts((prevNfts) =>
                prevNfts.map((nft) => (nft.id === id ? { ...nft, owner: 0 } : nft))
            );
            getBalance();
        }
    };

    const initUser = () => {
        if (!ethWallet) {
            return <p>Please install Metamask to use this ATM.</p>;
        }

        if (!account) {
            return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
        }

        if (balance === undefined) {
            getBalance();
        }

        return (
            <div className={styles.details}>
                <p>Your Account: {account}</p>
                <p>Your Balance: {balance} ETH</p>
                <button onClick={() => deposit(1, 0)}>Deposit 1 ETH</button>
            </div>
        );
    };

    useEffect(() => {
        getWallet();
    }, []);

    // Separate the NFTs based on owner status
    const availableNFTs = nfts.filter((nft) => nft.owner !== 0);
    const myNFTs = nfts.filter((nft) => nft.owner === 0);

    return (
        <main className={styles.container}>
            <header>
                <h1>Welcome to the Metacrafters NFT Market!</h1>
            </header>
            {initUser()}

            <div className={styles.mainWrapper}>
                <div className={styles.leftWrapper}>
                    <header>
                        <h1>Available NFTs</h1>
                    </header>
                    <div className={styles.nftList}>
                        {availableNFTs.map((nft) => (
                            <NFT
                                key={nft.id}
                                id={nft.id}
                                name={nft.name}
                                price={nft.price}
                                artist={nft.artist}
                                description={nft.description}
                                buy={withdraw}
                                sell={deposit}
                                owner={nft.owner}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.rightWrapper}>
                    <header>
                        <h1>My NFTs</h1>
                    </header>
                    <div className={styles.nftList}>
                        {myNFTs.map((nft) => (
                            <NFT
                                key={nft.id}
                                id={nft.id}
                                name={nft.name}
                                price={nft.price}
                                artist={nft.artist}
                                description={nft.description}
                                buy={withdraw} // Optional: if you want to allow withdrawal from "My NFTs"
                                sell={deposit} // Optional: if you want to allow deposit to "Available NFTs"
                                owner={nft.owner}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
