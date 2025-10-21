## Personal Wallet

# This is a personal wallet created from scratch without ethers.js/web3.js using spec256k1 for signing and keccak256 for hashing the message.

-   Sends a transaction to destination address with specified amount
-   Signs a message for payment channel, specified channel address and amount.

## Getting Started

First, create `.env` file and enter values:

> NEXT_PUBLIC_PRIVATE_KEY=8b391....
> and
> NEXT_PUBLIC_ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/28MGS....

## Run locally

```bash
npm run dev
```

##For testing only

> To reset the wallet use these commands in brower console:

```
localStorage.removeItem("walletAccounts");
```

and

```
localStorage.removeItem("wallet_encrypted");
```
