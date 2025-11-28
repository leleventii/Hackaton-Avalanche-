# SkillWager - Decentralized E-Sports Betting

SkillWager is a dApp on Avalanche C-Chain that allows gamers to bet on their own matches in a trustless way using an Optimistic Escrow system.

## Prerequisites

- Node.js v18+
- MetaMask or other Web3 Wallet

## Quick Start

### 1. Install Dependencies

```bash
# Root (Hardhat)
npm install

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 2. Start Local Blockchain

```bash
npx hardhat node
```

### 3. Deploy Contract

In a new terminal:

```bash
# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

**IMPORTANT**: Copy the deployed contract address and update `CONTRACT_ADDRESS` in:
- `frontend/src/app/page.tsx`
- `frontend/src/app/create/page.tsx`
- `frontend/src/app/match/[id]/page.tsx`
- `frontend/src/app/jury/page.tsx`

### 4. Start Backend Server

In a new terminal:

```bash
node backend/server.js
```

### 5. Start Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to start betting!

## Features

- **Create Match**: Set your wager and bond.
- **Join Match**: Accept a challenge.
- **Report Result**: Submit who won.
- **Dispute Resolution**: If results conflict, a jury votes.
- **Chat**: Real-time coordination.

## Hackathon Shortcuts

- **Mock Jurors**: The deployer account is automatically added as a juror.
- **Timeout**: Hardcoded to 5 minutes for demo purposes.
- **Storage**: GamerTags and Chats are stored in-memory (reset on server restart).
