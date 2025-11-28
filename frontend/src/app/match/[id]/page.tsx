'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SKILLWAGER_ABI } from '@/utils/abi';
import { formatEther, parseEther } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import ChatBox from '@/components/ChatBox';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function MatchRoom() {
    const params = useParams();
    const matchId = params.id as string;
    const { address } = useAccount();
    const [gamerTag, setGamerTag] = useState('');
    const [opponentTag, setOpponentTag] = useState('');

    // Contract Reads
    const { data: matchData, refetch, isError } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: SKILLWAGER_ABI,
        functionName: 'matches',
        args: [BigInt(matchId)],
        query: {
            retry: false,
        }
    });

    // Contract Writes
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSuccess) refetch();
    }, [isSuccess, refetch]);

    // Fetch GamerTags
    useEffect(() => {
        if (address) {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/gamertag/${address}`)
                .then(res => res.json())
                .then(data => setGamerTag(data.tag));
        }
        if (matchData) {
            const opponent = matchData[1] === address ? matchData[2] : matchData[1];
            if (opponent && opponent !== '0x0000000000000000000000000000000000000000') {
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/gamertag/${opponent}`)
                    .then(res => res.json())
                    .then(data => setOpponentTag(data.tag));
            }
        }
    }, [address, matchData]);

    if (isError) return <div className="p-8 text-center text-red-500">Error loading match. Please try again.</div>;
    if (!matchData) return <div className="p-8 text-center">Loading Match...</div>;

    const [id, playerA, playerB, wager, bond, state, resA, resB, lastAction, votesA, votesB] = matchData as any;
    const matchState = Number(state); // 0: OPEN, 1: LOCKED, 2: DISPUTE_L1, 3: DISPUTE_L2, 4: RESOLVED, 5: CANCELLED

    const isPlayer = address === playerA || address === playerB;
    const isPlayerA = address === playerA;

    // Actions
    const joinMatch = () => {
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: SKILLWAGER_ABI,
            functionName: 'joinMatch',
            args: [BigInt(matchId)],
            value: wager + bond,
        });
    };

    const submitResult = (result: number) => { // 1: WIN, 2: LOSS
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: SKILLWAGER_ABI,
            functionName: 'submitResult',
            args: [BigInt(matchId), result],
        });
    };

    const voteCancel = () => {
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: SKILLWAGER_ABI,
            functionName: 'voteToCancel',
            args: [BigInt(matchId)],
        });
    };

    const claimTimeout = () => {
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: SKILLWAGER_ABI,
            functionName: 'claimTimeoutVictory',
            args: [BigInt(matchId)],
        });
    };

    return (
        <main className="flex min-h-screen flex-col p-8 bg-background text-foreground">
            <nav className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-primary">Match #{matchId}</h1>
                <ConnectButton />
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Match Info & Actions */}
                <div className="md:col-span-2 space-y-6">

                    {/* Status Banner */}
                    <div className={`p-4 rounded-xl border ${matchState === 0 ? 'bg-blue-900/20 border-blue-500' :
                        matchState === 1 ? 'bg-yellow-900/20 border-yellow-500' :
                            matchState === 2 ? 'bg-red-900/20 border-red-500' :
                                'bg-gray-800 border-gray-600'
                        }`}>
                        <h2 className="text-xl font-bold mb-2">
                            STATUS: {
                                ['OPEN', 'LOCKED (IN PROGRESS)', 'DISPUTE (JURY)', 'APPEAL', 'RESOLVED', 'CANCELLED'][matchState]
                            }
                        </h2>
                        <p className="text-sm opacity-80">
                            {matchState === 0 ? "Waiting for opponent to join..." :
                                matchState === 1 ? "Match is live! Play your game and report results." :
                                    matchState === 2 ? "Dispute active. Jurors are voting." :
                                        "Match ended."}
                        </p>
                    </div>

                    {/* Players */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface p-6 rounded-xl border border-gray-800">
                            <p className="text-xs text-gray-500">CHALLENGER</p>
                            <p className="text-xl font-bold text-primary">{playerA === address ? `${gamerTag} (YOU)` : (opponentTag || 'Unknown')}</p>
                            <p className="text-xs font-mono mt-2">{playerA.slice(0, 6)}...{playerA.slice(-4)}</p>
                        </div>
                        <div className="bg-surface p-6 rounded-xl border border-gray-800">
                            <p className="text-xs text-gray-500">OPPONENT</p>
                            {playerB === '0x0000000000000000000000000000000000000000' ? (
                                <p className="text-xl font-bold text-gray-600">Waiting...</p>
                            ) : (
                                <>
                                    <p className="text-xl font-bold text-secondary">{playerB === address ? `${gamerTag} (YOU)` : (opponentTag || 'Unknown')}</p>
                                    <p className="text-xs font-mono mt-2">{playerB.slice(0, 6)}...{playerB.slice(-4)}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="bg-surface p-8 rounded-xl border border-gray-800 shadow-xl">
                        {matchState === 0 && address !== playerA && (
                            <div className="text-center">
                                <p className="mb-4 text-lg">Wager: {formatEther(wager)} AVAX + Bond: {formatEther(bond)} AVAX</p>
                                <button onClick={joinMatch} disabled={isPending} className="bg-primary text-black font-bold py-3 px-8 rounded-lg hover:bg-green-400 w-full">
                                    {isPending ? 'Joining...' : 'JOIN MATCH'}
                                </button>
                            </div>
                        )}

                        {matchState === 1 && isPlayer && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">Report Result</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => submitResult(1)} disabled={isPending} className="bg-primary text-black font-bold py-4 rounded-lg hover:bg-green-400">
                                        I WON
                                    </button>
                                    <button onClick={() => submitResult(2)} disabled={isPending} className="bg-red-500 text-white font-bold py-4 rounded-lg hover:bg-red-600">
                                        I LOST
                                    </button>
                                </div>

                                <div className="pt-6 border-t border-gray-800 flex justify-between items-center">
                                    <button onClick={voteCancel} className="text-xs text-gray-400 hover:text-white underline">
                                        Propose Cancellation (Mutual Refund)
                                    </button>
                                    <button onClick={claimTimeout} className="text-xs text-red-400 hover:text-red-300 underline">
                                        Claim Timeout Victory
                                    </button>
                                </div>
                            </div>
                        )}

                        {matchState === 2 && (
                            <div className="text-center py-8">
                                <p className="text-red-400 font-bold mb-4">DISPUTE IN PROGRESS</p>
                                <p className="text-sm text-gray-400">Jurors are reviewing the evidence. Please upload chat logs to IPFS if needed.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Chat */}
                <div className="md:col-span-1">
                    <ChatBox matchId={matchId} userAddress={address || ''} gamerTag={gamerTag} />

                    <div className="mt-4 p-4 bg-surface rounded-xl border border-gray-800">
                        <h3 className="font-bold text-sm mb-2">Match Details</h3>
                        <div className="space-y-2 text-xs text-gray-400">
                            <div className="flex justify-between">
                                <span>Wager</span>
                                <span className="text-white">{formatEther(wager)} AVAX</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Bond</span>
                                <span className="text-white">{formatEther(bond)} AVAX</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Pot</span>
                                <span className="text-primary">{formatEther((wager * 2n) + (bond * 2n))} AVAX</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
