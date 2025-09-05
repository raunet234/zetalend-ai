# ZetaLend Development Guide

This document provides guidance for developers working on the ZetaLend project.

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or another Web3 wallet
- Testnet tokens (ZETA, ETH, BNB, etc.)

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/zetalend-ai.git
cd zetalend-ai
```

2. Install dependencies:
```bash
npm install
cd frontend
npm install
cd ..
```

3. Set up environment variables:
```bash
# Create .env file for smart contract deployment
cp .env.example .env

# Create .env.local for frontend
cp frontend/.env.example frontend/.env.local
```

4. Edit the .env and .env.local files with your configuration:
- Add your wallet private key to .env
- Add your WalletConnect project ID to frontend/.env.local
- Set the deployed contract address in frontend/.env.local

### Development Workflow

#### Smart Contracts

1. Make changes to contracts in the `contracts/` directory
2. Compile contracts:
```bash
npx hardhat compile
```
3. Run tests:
```bash
npx hardhat test
```
4. Deploy to testnet:
```bash
npx hardhat run scripts/deploy.js --network zetachain_testnet
```

#### Frontend

1. Make changes to frontend code in the `frontend/src/` directory
2. Start the development server:
```bash
cd frontend
npm run dev
```
3. Open http://localhost:3000 in your browser

### Testing

#### Smart Contract Testing

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/ZetaLend.test.js
```

#### Frontend Testing

```bash
cd frontend
npm run test
```

### Debugging

#### Smart Contract Debugging

1. Use `console.log` statements in your contracts (for testnet debugging)
2. Check transaction details on [ZetaChain Explorer](https://explorer.zetachain.com/)
3. Use Hardhat's debugging tools:
```bash
npx hardhat console --network zetachain_testnet
```

#### Frontend Debugging

1. Use React Developer Tools browser extension
2. Check browser console for logs and errors
3. Use the Network tab to inspect API calls

## Working with ZetaChain

### Getting Testnet Tokens

1. Visit the [ZetaChain Faucet](https://labs.zetachain.com/get-zeta)
2. Connect your wallet
3. Request testnet ZETA tokens

### Understanding Cross-Chain Transactions

ZetaChain's omnichain smart contracts allow for:
- Native cross-chain messaging
- Reading state from connected chains
- Initiating transactions on connected chains

For detailed documentation, refer to [ZetaChain Docs](https://www.zetachain.com/docs/).

## AI Integration

The AI components will be integrated using:

1. Gemini API for risk analysis
2. Custom machine learning models for credit scoring
3. Anomaly detection systems for fraud prevention

Integration will be done via:
- Backend API endpoints that process user data
- Secure handling of sensitive information
- Caching mechanisms to optimize response times

## Code Style Guide

- Use consistent naming conventions
- Write comprehensive comments
- Create meaningful commit messages
- Follow TypeScript best practices
- Keep components small and focused

## Release Process

1. Feature branches -> development branch -> main branch
2. Run comprehensive tests before merging
3. Deploy to testnet for validation
4. Document changes in release notes
5. Deploy to production
