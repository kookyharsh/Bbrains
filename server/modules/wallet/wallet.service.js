import prisma from "../../utils/prisma.js";

const transferFunds = async (senderId, recipientWalletId, amount, note, pin) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Verify Sender Wallet & PIN
        const senderWallet = await tx.wallet.findUnique({
            where: { userId: senderId }
        });

        if (!senderWallet) throw new Error("Sender wallet not found");
        if (senderWallet.pin !== pin) throw new Error("Invalid PIN");

        if (Number(senderWallet.balance) < Number(amount)) {
            throw new Error("Insufficient balance");
        }

        // 2. Verify Recipient Wallet (by ID or User ID if you prefer, going by Wallet ID for QR)
        // Assuming recipientWalletId is the Wallet ID (int). 
        // If it's a UserID, adjust query.
        const recipientWallet = await tx.wallet.findUnique({
            where: { id: parseInt(recipientWalletId) }
        });

        if (!recipientWallet) throw new Error("Recipient wallet not found");
        if (recipientWallet.userId === senderId) throw new Error("Cannot send to self");

        // 3. Perform Transfer
        await tx.wallet.update({
            where: { id: senderWallet.id },
            data: { balance: { decrement: amount } }
        });

        await tx.wallet.update({
            where: { id: recipientWallet.id },
            data: { balance: { increment: amount } }
        });

        // 4. Log Transactions (Debit for Sender, Credit for Recipient)
        const debitTx = await tx.transactionHistory.create({
            data: {
                userId: senderId,
                amount: amount,
                type: 'debit',
                status: 'success',
                note: `Sent to Wallet #${recipientWallet.id}: ${note || ''}`
            }
        });

        const creditTx = await tx.transactionHistory.create({
            data: {
                userId: recipientWallet.userId,
                amount: amount,
                type: 'credit',
                status: 'success',
                note: `Received from Wallet #${senderWallet.id}: ${note || ''}`
            }
        });

        return { debitTx, creditTx };
    });
};

const getTransactionHistory = async (userId) => {
    return await prisma.transactionHistory.findMany({
        where: { userId },
        orderBy: { transactionDate: 'desc' }
    });
};

const getWalletDetails = async (userId) => {
    return await prisma.wallet.findUnique({
        where: { userId },
        include: {
            user: {
                select: { username: true, email: true }
            }
        }
    });
};

export { transferFunds, getTransactionHistory, getWalletDetails };
