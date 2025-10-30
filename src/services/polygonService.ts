import { ethers } from 'ethers';

// --- Polygon Amoy Testnet (replaces deprecated Mumbai) ---
export const POLYGON_AMOY_CONFIG = {
  chainId: "0x13882", // 80002
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: [
    'https://rpc-amoy.polygon.technology',
    'https://polygon-amoy-bor-rpc.publicnode.com',
  ],
  blockExplorerUrls: ['https://www.oklink.com/amoy'],
};

// --- Polygon Mainnet ---
export const POLYGON_MAINNET_CONFIG = {
  chainId: "0x89", // 137
  chainName: 'Polygon',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com/'],
  blockExplorerUrls: ['https://polygonscan.com/'],
};

// --- Contract ABI ---
const IDENTITY_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_aadhaar", type: "string" },
      { internalType: "string", name: "_phone", type: "string" },
      { internalType: "string", name: "_email", type: "string" }
    ],
    name: "createIdentity",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_identityId", type: "uint256" }],
    name: "getIdentity",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "aadhaar", type: "string" },
      { internalType: "string", name: "phone", type: "string" },
      { internalType: "string", name: "email", type: "string" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "bool", name: "isVerified", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_identityId", type: "uint256" }],
    name: "verifyIdentity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "uint256", name: "identityId", type: "uint256" },
    ],
    name: "IdentityCreated",
    type: "event",
  },
];

// --- Contract Address (from env) ---
const ENV_CONTRACT_ADDRESS = (import.meta as any)?.env?.VITE_CONTRACT_ADDRESS as string | undefined;

function isValidAddress(address: string | undefined): address is string {
  try {
    return !!address && ethers.isAddress(address);
  } catch {
    return false;
  }
}

// --- Interfaces ---
export interface UserIdentity {
  name: string;
  aadhaar: string;
  phone: string;
  email?: string;
}

export interface BlockchainIdentity extends UserIdentity {
  identityId: string;
  timestamp: number;
  owner: string;
  isVerified: boolean;
  transactionHash: string;
  blockNumber: number;
}

// --- Polygon Service Class ---
export class PolygonService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private accountsChangedHandler?: (accounts: string[]) => void;
  private chainChangedHandler?: (chainId: string) => void;

  // Connect wallet & ensure correct network
  async connectWallet(): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) throw new Error('MetaMask not installed');
    const ethereum = window.ethereum;
    if (!ethereum.isMetaMask) throw new Error('Please use MetaMask');

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) throw new Error('No MetaMask accounts found');

    this.provider = new ethers.BrowserProvider(ethereum);
    this.signer = await this.provider.getSigner();
    // Ensure correct network BEFORE creating contract instance
    await this.ensureCorrectNetwork();
    if (isValidAddress(ENV_CONTRACT_ADDRESS)) {
      this.contract = new ethers.Contract(ENV_CONTRACT_ADDRESS, IDENTITY_CONTRACT_ABI, this.signer);
    } else {
      this.contract = null;
    }
    this.setupEthereumListeners();
    return accounts[0];
  }

  // Ensure MetaMask is on Amoy testnet
  private async ensureCorrectNetwork(): Promise<void> {
    if (!this.provider) throw new Error('Provider not initialized');
    const network = await this.provider.getNetwork();
    const targetChainId = BigInt(POLYGON_AMOY_CONFIG.chainId);

    // network.chainId is bigint in ethers v6
    if (network.chainId !== targetChainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: POLYGON_AMOY_CONFIG.chainId }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          // Add network if not found
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_AMOY_CONFIG],
          });
        } else {
          throw new Error(`Network switch failed: ${error.message}`);
        }
      }
    }
  }

  private setupEthereumListeners(): void {
    if (!window.ethereum) return;

    // Clean previous listeners if any
    if (this.accountsChangedHandler && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', this.accountsChangedHandler as any);
    }
    if (this.chainChangedHandler && window.ethereum.removeListener) {
      window.ethereum.removeListener('chainChanged', this.chainChangedHandler as any);
    }

    this.accountsChangedHandler = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        this.signer = null;
        this.contract = null;
        return;
      }
      if (this.provider) {
        this.signer = await this.provider.getSigner();
        if (isValidAddress(ENV_CONTRACT_ADDRESS)) {
          this.contract = new ethers.Contract(ENV_CONTRACT_ADDRESS, IDENTITY_CONTRACT_ABI, this.signer);
        }
      }
    };

    this.chainChangedHandler = async (_chainId: string) => {
      try {
        await this.ensureCorrectNetwork();
        if (this.provider) {
          this.signer = await this.provider.getSigner();
          if (isValidAddress(ENV_CONTRACT_ADDRESS)) {
            this.contract = new ethers.Contract(ENV_CONTRACT_ADDRESS, IDENTITY_CONTRACT_ABI, this.signer);
          }
        }
      } catch (e) {
        console.error('chainChanged handling failed', e);
      }
    };

    window.ethereum.on && window.ethereum.on('accountsChanged', this.accountsChangedHandler as any);
    window.ethereum.on && window.ethereum.on('chainChanged', this.chainChangedHandler as any);
  }

  // Create identity on-chain
  async createBlockchainIdentity(user: UserIdentity): Promise<BlockchainIdentity> {
    if (!this.signer) throw new Error('Wallet not connected');
    if (!this.contract) throw new Error('Contract not configured. Set VITE_CONTRACT_ADDRESS.');

    const hashedAadhaar = ethers.keccak256(ethers.toUtf8Bytes(user.aadhaar));
    const tx = await this.contract.createIdentity(user.name, hashedAadhaar, user.phone, user.email || '');
    const receipt = await tx.wait();

    const eventLog = receipt.logs.find(log => {
      try { return this.contract!.interface.parseLog(log).name === 'IdentityCreated'; } 
      catch { return false; }
    });
    if (!eventLog) throw new Error('IdentityCreated event not found');

    const parsedEvent = this.contract.interface.parseLog(eventLog);
    const identityId = parsedEvent.args[1].toString();

    return {
      ...user,
      identityId,
      timestamp: Date.now(),
      owner: await this.signer.getAddress(),
      isVerified: false,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  // Mock ID generator for testing/demo
  public generateMockBlockchainID(user: UserIdentity): BlockchainIdentity {
    const mockId = Date.now().toString();
    const mockTxHash = '0x' + Math.random().toString(16).slice(2).repeat(3);
    return {
      ...user,
      identityId: mockId,
      timestamp: Date.now(),
      owner: '0x' + Math.random().toString(16).slice(2, 42),
      isVerified: true,
      transactionHash: mockTxHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
    };
  }

  async getIdentity(identityId: string): Promise<BlockchainIdentity | null> {
    if (!this.contract) throw new Error('Contract not initialized');
    try {
      const identity = await this.contract.getIdentity(identityId);
      return {
        name: identity[0],
        aadhaar: identity[1],
        phone: identity[2],
        email: identity[3],
        identityId,
        timestamp: Number(identity[4]) * 1000,
        owner: identity[5],
        isVerified: identity[6],
        transactionHash: '',
        blockNumber: 0,
      };
    } catch {
      return null;
    }
  }

  async verifyIdentity(identityId: string): Promise<string> {
    if (!this.signer) throw new Error('Wallet not connected');
    if (!this.contract) throw new Error('Contract not configured. Set VITE_CONTRACT_ADDRESS.');
    const tx = await this.contract.verifyIdentity(identityId);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  isWalletConnected(): boolean {
    return !!this.provider && !!this.signer;
  }

  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
  }

  public async getSignerAddress(): Promise<string | null> {
    try {
      if (!this.signer) return null;
      return await this.signer.getAddress();
    } catch {
      return null;
    }
  }
}

export const polygonService = new PolygonService();

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (args: any) => void) => void;
      removeListener?: (event: string, callback: (args: any) => void) => void;
    };
  }
}
