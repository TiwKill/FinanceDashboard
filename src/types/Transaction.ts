export interface Transaction {
    id: number
    date: string
    type: "รายรับ" | "รายจ่าย"
    amount: number
    category: string
    description: string
}

export interface Summary {
    totalIncome: number
    totalExpense: number
    balance: number
}

export interface FinancialPlan {
    weeklySavings: number
    monthlySavings: number
    dailySpending: number
    weeklySpending: number
    monthlySpending: number
    savingsTargetPercentage: number
    remainingBalance: number
    daysUntilNextSalary: number
    projectedBalanceBeforeNextSalary: number
    recommendedDailyBudget: number
}

export interface InvestmentPlan {
    totalInvestmentBudget: number
    forexInvestment: number
    stockInvestment: number
    forexPercentage: number
    stockPercentage: number
    monthlyForex: number
    monthlyStock: number
    weeklyForex: number
    weeklyStock: number
}

export interface SalaryPattern {
    frequency: "daily" | "weekly" | "bi-weekly" | "monthly"
    amount: number
    nextExpectedDate: string
    lastSalaryDate: string
    averageInterval: number
}

export interface CategorySpending {
    category: string
    amount: number
    percentage: number
    count: number
}

export interface SheetsApiResponse {
    data?: Transaction[]
    error?: string
    message?: string
}

export interface SpendingPattern {
    category: string
    averageMonthly: number
    averageWeekly: number
    averageDaily: number
    frequency: number // number of transactions per month
    isRecurring: boolean // if it appears regularly
    predictedNextMonth: number
    variance: number // standard deviation
}

export interface DescriptionGroup {
    groupName: string
    keywords: string[]
    totalAmount: number
    count: number
    averageAmount: number
    category: string
}

export interface DynamicBudget {
    predictedExpenses: number
    fixedExpenses: number
    variableExpenses: number
    categoryBudgets: Map<string, number>
    confidenceLevel: number // 0-100
    basedOnMonths: number
}

export interface RecurringExpense {
    description: string
    category: string
    averageAmount: number
    frequency: "daily" | "weekly" | "monthly"
    lastOccurrence: string
    nextExpected: string
}

export interface Trade {
    id: number
    date: string
    type: "LONG" | "SHORT"
    symbol: string
    lotSize: number
    entryPrice: number
    exitPrice: number
    profitLoss: number
    percentage: number
    status: "OPEN" | "CLOSED"
    category: string
    description: string
}

export interface Investment {
    id: number
    date: string
    symbol: string
    shares: number
    buyPrice: number
    currentPrice: number
    totalValue: number
    profitLoss: number
    percentage: number
    category: string
    description: string
}

export interface InvestmentAnalysis {
    totalInvested: number
    currentValue: number
    totalProfitLoss: number
    totalPercentage: number
    trades: Trade[]
    investments: Investment[]
    forexPerformance: {
        totalTrades: number
        winningTrades: number
        losingTrades: number
        winRate: number
        totalProfit: number
        totalLoss: number
        netProfit: number
    }
    stockPerformance: {
        totalInvested: number
        currentValue: number
        profitLoss: number
        percentage: number
    }
    monthlyPerformance: Array<{
        month: string
        forex: number
        stocks: number
        total: number
    }>
}