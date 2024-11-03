import { GetFormatterForCurrency } from "@/lib/helpers";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const transactions = await getAllTransactionsHistory(user.id);
    return Response.json(transactions);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}

export type GetAllTransactionHistoryResponseType = Awaited<
  ReturnType<typeof getAllTransactionsHistory>
>;

async function getAllTransactionsHistory(userId: string) {
  // Retrieve user settings to format currency based on user preference
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId,
    },
  });
  
  if (!userSettings) {
    throw new Error("User settings not found");
  }

  const formatter = GetFormatterForCurrency(userSettings.currency);

  // Fetch all transactions for the user without date filters
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
  });

  return transactions.map((transaction) => ({
    ...transaction,
    formattedAmount: formatter.format(transaction.amount),
  }));
}
