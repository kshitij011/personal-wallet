import WalletRedirect from "./components/WalletRedirect";

export default function Home() {
    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center relative overflow-hidden">
            {/* Glowing circles */}
            <div className="absolute w-96 h-96 bg-purple-700/30 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-blue-600/30 rounded-full blur-3xl bottom-[-120px] right-[-100px] animate-pulse"></div>

            {/* Content */}
            <div className="relative z-10 p-8">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-6 animate-pulse">
                    Welcome to your{" "}
                    <span className="block text-purple-400">
                        Personal Wallet
                    </span>
                </h1>
                <p className="text-gray-300 text-lg md:text-xl">
                    Securely manage your digital assets with ease.
                </p>
                <p className="text-gray-400 text-sm mt-4 italic">
                    Redirecting you to your wallet...
                </p>
            </div>
            <WalletRedirect />
        </main>
    );
}
