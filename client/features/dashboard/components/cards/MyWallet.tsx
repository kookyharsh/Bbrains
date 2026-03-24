import { Wallet, ArrowUp, ArrowDown, QrCode, MoreHorizontal } from "lucide-react"

export function MyWallet() {
    return (
        <div className="bg-ui-light-surface dark:bg-ui-dark-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary flex items-center gap-2">
                    <Wallet className="text-brand-mint h-5 w-5" />
                    My Wallet
                </h3>
                <button className="text-ui-light-textSecondary hover:text-brand-purple transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>
            <div>
                <p className="text-sm text-ui-light-textSecondary dark:text-ui-dark-textSecondary">Total Balance</p>
                <h4 className="text-3xl font-bold text-ui-light-textPrimary dark:text-ui-dark-textPrimary mt-1">2,450 <span className="text-base font-normal text-ui-light-textSecondary">B-Coins</span></h4>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
                <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-ui-light-bg dark:bg-ui-dark-bg hover:bg-black/5 dark:hover:bg-white/5 text-ui-light-textPrimary dark:text-ui-dark-textPrimary transition-colors">
                    <ArrowUp className="mb-1 text-brand-purple h-5 w-5" />
                    <span className="text-xs font-medium">Send</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-ui-light-bg dark:bg-ui-dark-bg hover:bg-black/5 dark:hover:bg-white/5 text-ui-light-textPrimary dark:text-ui-dark-textPrimary transition-colors">
                    <ArrowDown className="mb-1 text-brand-mint h-5 w-5" />
                    <span className="text-xs font-medium">Receive</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-ui-light-bg dark:bg-ui-dark-bg hover:bg-black/5 dark:hover:bg-white/5 text-ui-light-textPrimary dark:text-ui-dark-textPrimary transition-colors">
                    <QrCode className="mb-1 text-ui-light-textPrimary dark:text-ui-dark-textPrimary h-5 w-5" />
                    <span className="text-xs font-medium">Qr Code</span>
                </button>
            </div>
        </div>
    )
}
