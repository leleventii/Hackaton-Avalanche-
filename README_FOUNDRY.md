# SkillWager - Foundry Edition

This project has been migrated to Foundry.

## Prerequisites

- [Foundry](https://getfoundry.sh/)
- Node.js v18+

## Setup

1. Install Foundry:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. Install Dependencies:
   ```bash
   forge install
   ```
   *Note: If `forge install` fails because git is not initialized, run `git init` first.*

## Commands

### Build
```bash
forge build
```

### Test
```bash
forge test
```

### Deploy to Fuji Testnet
```bash
# Set your private key
export PRIVATE_KEY=0x...

# Deploy
forge script script/DeploySkillWager.s.sol --rpc-url fuji --broadcast
```

### Deploy to Avalanche Mainnet
```bash
forge script script/DeploySkillWager.s.sol --rpc-url mainnet --broadcast
```

## Frontend

The frontend is located in `frontend/`.

1. Update `CONTRACT_ADDRESS` in `frontend/src/app/page.tsx` (and other pages) after deployment.
2. Run:
   ```bash
   cd frontend
   npm run dev
   ```
