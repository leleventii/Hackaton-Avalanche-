'use client';

import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SKILLWAGER_ABI } from '@/utils/abi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function JuryDashboard() {
    const [matchId, setMatchId] = useState('');

    // In a real app, we'd fetch all disputed matches assigned to the juror.
    // Here we manually input ID for the demo.

    const { data: matchData } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: SKILLWAGER_ABI,
        functionName: 'matches',
        args: matchId ? [BigInt(matchId)] : undefined,
        query: {
            enabled: !!matchId,
        }
    });

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash });

    const castVote = (vote: number) => { // 1: Player A, 2: Player B
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: SKILLWAGER_ABI,
            functionName: 'juryVote',
            args: [BigInt(matchId), vote],
        });
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-8 bg-background text-foreground">
            <nav className="w-full flex justify-between items-center mb-12">
                <h1 className="text-2xl font-bold text-primary">Jury Duty</h1>
                <ConnectButton />
            </nav>

            <div className="w-full max-w-2xl bg-surface p-8 rounded-2xl border border-gray-800">
                <h2 className="text-2xl font-bold mb-6">Resolve Dispute</h2>

                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Enter Match ID to Review</label>
                    <div className="flex gap-4">
                        <input
                            type="number"
                            value={matchId}
                            onChange={(e) => setMatchId(e.target.value)}
                            className="flex-1 bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                            placeholder="e.g. 0"
                        />
                    </div>
                </div>

                {matchData && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="p-4 bg-black rounded-lg border border-gray-800">
                            <h3 className="font-bold text-lg mb-4">Match Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Player A (Challenger)</p>
                                    <p className="font-mono text-primary">{(matchData as any)[1]}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Player B (Opponent)</p>
                                    <p className="font-mono text-secondary">{(matchData as any)[2]}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-black rounded-lg border border-gray-800">
                            <h3 className="font-bold text-lg mb-2">Evidence</h3>
                            <p className="text-gray-400 text-sm">
                                Check the chat logs and screenshots provided by players.
                                (Link to IPFS/Backend Chat Logs would go here)
                            </p>
                            <a
                                href={`http://localhost:3001/api/chat/${matchId}`}
                                target="_blank"
                                className="text-primary underline text-sm mt-2 block"
                            >
                                View Chat Logs (JSON)
                            </a>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => castVote(1)}
                                disabled={isPending}
                                className="bg-primary text-black font-bold py-4 rounded-lg hover:bg-green-400 disabled:opacity-50"
                            >
                                VOTE PLAYER A
                            </button>
                            <button
                                onClick={() => castVote(2)}
                                disabled={isPending}
                                className="bg-secondary text-black font-bold py-4 rounded-lg hover:bg-pink-400 disabled:opacity-50"
                            >
                                VOTE PLAYER B
                            </button>
                        </div>

                        {isSuccess && (
                            <div className="p-4 bg-green-900/20 border border-green-500 rounded text-green-400 text-center">
                                Vote Cast Successfully!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
