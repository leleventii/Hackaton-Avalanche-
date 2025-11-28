'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { SKILLWAGER_ABI } from '@/utils/abi';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function CreateMatch() {
    const router = useRouter();
    const { address } = useAccount();
    const [gamerTag, setGamerTag] = useState('');
    const [wager, setWager] = useState('1');
    const [bond, setBond] = useState('0.5');

    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const handleCreate = async () => {
        if (!gamerTag) return alert("Please enter your GamerTag");

        // 1. Register GamerTag with Backend
        try {
            await fetch('http://localhost:3001/api/gamertag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, tag: gamerTag }),
            });
        } catch (e) {
            console.error("Backend error", e);
            // Proceed anyway for demo
        }

        // 2. Create Match On-Chain
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: SKILLWAGER_ABI,
            functionName: 'createMatch',
            args: [parseEther(wager), parseEther(bond)],
            value: parseEther(wager) + parseEther(bond),
        });
    };

    if (isSuccess) {
        // Redirect to lobby or match page (ideally we get the ID from logs, but for now lobby)
        setTimeout(() => router.push('/'), 2000);
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-8 bg-background text-foreground">
            <nav className="w-full flex justify-between items-center mb-12">
                <h1 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => router.push('/')}>
                    SkillWager
                </h1>
                <ConnectButton />
            </nav>

            <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-gray-800 shadow-2xl">
                <h2 className="text-3xl font-bold mb-8 text-center">Create Match</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Your GamerTag (PSN/Xbox)</label>
                        <input
                            type="text"
                            value={gamerTag}
                            onChange={(e) => setGamerTag(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                            placeholder="e.g. xX_Slayer_Xx"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Wager Amount (AVAX)</label>
                        <input
                            type="number"
                            value={wager}
                            onChange={(e) => setWager(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Bond Amount (AVAX)</label>
                        <input
                            type="number"
                            value={bond}
                            onChange={(e) => setBond(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Bond is returned if you play honestly.</p>
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={isPending || isConfirming}
                        className="w-full bg-primary text-black font-bold py-4 rounded-lg hover:bg-green-400 transition-all disabled:opacity-50"
                    >
                        {isPending ? 'Check Wallet...' : isConfirming ? 'Confirming...' : isSuccess ? 'Success!' : 'CREATE MATCH'}
                    </button>
                </div>
            </div>
        </main>
    );
}
