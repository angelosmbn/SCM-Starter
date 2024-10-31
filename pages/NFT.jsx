import styles from "../pages/HomePage.module.css"; // Import as CSS module

function NFT(props) {
    const handleBuy = () => {
        // Call the buy function passed from the parent and provide the NFT ID
        props.buy(props.price, props.id);
    };

    const handleSell = () => {
        // Call the sell function passed from the parent and provide the NFT ID
        props.sell(props.price, props.id);
    };

    return (
        <div className={styles.NFTCard}>
            <div className={styles.NFTCardPic}>
                IMG HERE
            </div>
            <h2>{props.name}</h2>
            <h3>{props.price} ETH</h3>
            <h3>{props.artist}</h3>
            <p>{props.description}</p>
            <p>Owner: {props.owner}</p>
            {props.owner === 0 ? (
                <button onClick={handleSell}>Sell</button>
            ) : (
                <button onClick={handleBuy}>Buy</button>
            )}
        </div>
    );
}

export default NFT;
