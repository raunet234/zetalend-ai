import WalletConnect from '@/components/WalletConnect';
import LendingInterface from '@/components/LendingInterface';
import TransactionStatus from '@/components/TransactionStatus';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            ZetaLend
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Cross-chain lending protocol powered by ZetaChain. Deposit ETH on Ethereum, borrow USDT on BSC, and more.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          <WalletConnect />
          <LendingInterface />
          <TransactionStatus />
        </div>
      </div>
    </main>
  );
}
