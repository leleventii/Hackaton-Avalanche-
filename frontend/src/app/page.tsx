'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { SKILLWAGER_ABI } from '@/utils/abi';
import { formatEther } from 'viem';
import { useState, useEffect } from 'react';

// Hardcoded contract address for now - replace after deployment
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Localhost default

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);

  // In a real app we would index this with The Graph or similar.
  // For MVP, we'll just read the counter and loop (inefficient but works for small scale).
  const { data: matchCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SKILLWAGER_ABI,
    functionName: 'matchIdCounter',
  });

  // Fetch matches logic would go here. For now, let's just show a static list or fetch one by one if count is small.
  // Since hooks can't be in loops easily, we might need a separate component or a multicall.
  // For this MVP, let's just link to Create Match and show a placeholder list.

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-background text-foreground">
      <nav className="w-full flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          SkillWager
        </h1>
        <ConnectButton />
      </nav>

      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Lobby</h2>
          <Link
            href="/create"
            className="bg-primary text-black font-bold py-3 px-6 rounded-lg hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(0,255,157,0.5)]"
          >
            CREATE MATCH
          </Link>
        </div>

        <div className="grid gap-4">
          {/* Placeholder for matches */}
          <div className="bg-surface p-6 rounded-xl border border-gray-800 hover:border-primary transition-all">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">FIFA 24 - PS5</h3>
                <p className="text-gray-400">Wager: 10 AVAX</p>
              </div>
              <Link
                href="/match/0"
                className="bg-surface-hover border border-primary text-primary py-2 px-6 rounded hover:bg-primary hover:text-black transition-all"
              >
                JOIN
              </Link>
            </div>
          </div>

          <div className="text-center text-gray-500 mt-8">
            {matchCount ? `Total Matches Created: ${matchCount.toString()}` : 'Loading stats...'}
          </div>
        </div>
      </div>
    </main>
  );
}
