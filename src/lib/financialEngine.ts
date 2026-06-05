import type { NormalizedFinancialRecord } from './semanticMapping';

// ==================== CORE FINANCIAL RATIOS ====================

export interface ProfitabilityRatios {
  grossMargin: number;           // Gross Profit / Revenue
  operatingMargin: number;       // EBIT / Revenue
  ebitdaMargin: number;          // EBITDA / Revenue
  netMargin: number;             // Net Income / Revenue
  roa: number;                   // Net Income / Total Assets
  roe: number;                   // Net Income / Total Equity
  roce: number;                  // EBIT / (Total Assets - Current Liabilities)
  roic: number;                  // NOPAT / Invested Capital
}

export interface LiquidityRatios {
  currentRatio: number;          // Current Assets / Current Liabilities
  quickRatio: number;            // (Current Assets - Inventory) / Current Liabilities
  cashRatio: number;             // Cash / Current Liabilities
  workingCapital: number;        // Current Assets - Current Liabilities
  ocfRatio: number;              // Operating Cash Flow / Current Liabilities
}

export interface SolvencyRatios {
  debtRatio: number;             // Total Liabilities / Total Assets
  debtToEquity: number;          // Total Liabilities / Total Equity
  equityRatio: number;           // Total Equity / Total Assets
  interestCoverage: number;      // EBIT / Interest Expense
  financialLeverage: number;     // Total Assets / Total Equity
}

export interface EfficiencyRatios {
  assetTurnover: number;         // Revenue / Total Assets
  fixedAssetTurnover: number;    // Revenue / Fixed Assets
  inventoryTurnover: number;     // COGS / Average Inventory
  dio: number;                   // Days Inventory Outstanding
  arTurnover: number;            // Revenue / Average AR
  dso: number;                   // Days Sales Outstanding
  apTurnover: number;            // COGS / Average AP
  dpo: number;                   // Days Payable Outstanding
  ccc: number;                   // Cash Conversion Cycle = DIO + DSO - DPO
}

export interface DuPontAnalysis {
  roe: number;
  netProfitMargin: number;
  assetTurnover: number;
  financialLeverage: number;
  npmContribution: number;       // % of ROE from margin
  atoContribution: number;       // % of ROE from turnover
  flContribution: number;        // % of ROE from leverage
}

export interface EarningsQuality {
  accrualsRatio: number;         // (Net Income - OCF) / Total Assets
  cashToEarningsRatio: number;   // OCF / Net Income
  nonRecurringItems: number;     // Detected one-time items
  sustainabilityScore: number;   // 0-100
  quality: 'high' | 'moderate' | 'low';
  description: string;
}

export interface CashFlowAnalysis {
  ocf: number;
  icf: number;
  fcf: number;
  burnRate: number;              // Monthly cash burn
  monthsRunway: number;          // Cash / Burn Rate
  liquidityRisk: 'safe' | 'caution' | 'danger';
  fundingDependency: number;     // % of expenses not covered by operations
  freeCashFlow: number;          // OCF - CapEx
  ocfToNetIncome: number;
}

export interface AltmanZScore {
  zScore: number;
  zone: 'safe' | 'grey' | 'distress';
  probability: number;
  components: {
    x1: number; // Working Capital / Total Assets
    x2: number; // Retained Earnings / Total Assets
    x3: number; // EBIT / Total Assets
    x4: number; // Market Value Equity / Book Value Total Liabilities (or Equity/Liabilities)
    x5: number; // Revenue / Total Assets
  };
}

export interface BeneishMScore {
  mScore: number;
  isManipulator: boolean;
  components: {
    dsri: number;  // Days Sales Receivable Index
    gmi: number;   // Gross Margin Index
    aqi: number;   // Asset Quality Index
    sgi: number;   // Sales Growth Index
    depi: number;  // Depreciation Index
    sgai: number;  // SGA Index
    lvgi: number;  // Leverage Index
    tata: number;  // Total Accruals to Total Assets
  };
}

export interface FinancialScore {
  overall: number;           // 0-100
  profitability: number;     // 0-100
  liquidity: number;         // 0-100
  solvency: number;          // 0-100
  efficiency: number;        // 0-100
  growth: number;            // 0-100
  cashFlow: number;          // 0-100
  earningsQuality: number;   // 0-100
  label: string;             // Excellent / Good / Needs Improvement / High Risk
}

export interface ForecastPoint {
  period: string;
  value: number;
  lowerBound: number;
  upperBound: number;
}

export interface Forecasts {
  revenue: ForecastPoint[];
  profit: ForecastPoint[];
  ebitda: ForecastPoint[];
  cashFlow: ForecastPoint[];
  cashBalance: ForecastPoint[];
  workingCapital: ForecastPoint[];
}

export interface ScenarioCase {
  name: string;
  revenueGrowth: number;
  costChange: number;
  projectedRevenue: number;
  projectedProfit: number;
  projectedCash: number;
  projectedLiquidity: number;
}

export interface ScenarioAnalysis {
  bestCase: ScenarioCase;
  baseCase: ScenarioCase;
  worstCase: ScenarioCase;
}

export interface BenchmarkComparison {
  metric: string;
  companyValue: number;
  industryAvg: number;
  percentile: number;
  status: 'above' | 'at' | 'below';
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  cash: number;
  assets: number;
  liabilities: number;
}

export interface ComprehensiveFinancials {
  // Basic metrics
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  netMargin: number;
  revenueGrowth: number;
  expenseGrowth: number;

  // Balance sheet
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  cash: number;
  inventory: number;
  accountsReceivable: number;
  accountsPayable: number;

  // All ratio categories
  profitability: ProfitabilityRatios;
  liquidity: LiquidityRatios;
  solvency: SolvencyRatios;
  efficiency: EfficiencyRatios;
  dupont: DuPontAnalysis;
  earningsQuality: EarningsQuality;
  cashFlow: CashFlowAnalysis;
  altmanZ: AltmanZScore;
  beneishM: BeneishMScore;
  score: FinancialScore;

  // Trends
  forecasts: Forecasts;
  scenarioAnalysis: ScenarioAnalysis;
  benchmarks: BenchmarkComparison[];

  // Raw monthly data for charts
  months: string[];
  monthlyRevenue: number[];
  monthlyExpenses: number[];
  monthlyNetIncome: number[];
  monthlyCash: number[];
  monthlyAssets: number[];
  monthlyLiabilities: number[];
}

// ==================== CALCULATION FUNCTIONS ====================

function safeDivide(a: number, b: number): number {
  if (!b || b === 0 || !isFinite(b)) return 0;
  const result = a / b;
  return isFinite(result) ? result : 0;
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function growthRate(current: number, previous: number): number {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// Calculate profitability ratios from a single period record
export function calculateProfitabilityRatios(data: NormalizedFinancialRecord): ProfitabilityRatios {
  const revenue = data.revenue || 1;
  const grossProfit = data.grossProfit || (data.revenue - data.cogs);
  const ebit = data.ebit || (grossProfit - data.operatingExpenses);
  const ebitda = data.ebitda || (ebit + data.depreciation);
  const netIncome = data.netIncome || (ebit - data.interestExpense - data.tax);
  const nopat = ebit * (1 - 0.2); // assume 20% tax rate if not provided
  const investedCapital = data.totalEquity + (data.longTermDebt || 0);

  return {
    grossMargin: safeDivide(grossProfit, revenue) * 100,
    operatingMargin: safeDivide(ebit, revenue) * 100,
    ebitdaMargin: safeDivide(ebitda, revenue) * 100,
    netMargin: safeDivide(netIncome, revenue) * 100,
    roa: safeDivide(netIncome, data.totalAssets) * 100,
    roe: safeDivide(netIncome, data.totalEquity) * 100,
    roce: safeDivide(ebit, data.totalAssets - data.currentLiabilities) * 100,
    roic: safeDivide(nopat, investedCapital) * 100,
  };
}

export function calculateLiquidityRatios(data: NormalizedFinancialRecord): LiquidityRatios {
  const currentAssets = data.currentAssets || (data.cash + data.accountsReceivable + data.inventory);
  const currentLiabilities = data.currentLiabilities || data.accountsPayable || 1;

  return {
    currentRatio: safeDivide(currentAssets, currentLiabilities),
    quickRatio: safeDivide(currentAssets - data.inventory, currentLiabilities),
    cashRatio: safeDivide(data.cash, currentLiabilities),
    workingCapital: currentAssets - currentLiabilities,
    ocfRatio: safeDivide(data.operatingCashFlow, currentLiabilities),
  };
}

export function calculateSolvencyRatios(data: NormalizedFinancialRecord): SolvencyRatios {
  return {
    debtRatio: safeDivide(data.totalLiabilities, data.totalAssets),
    debtToEquity: safeDivide(data.totalLiabilities, data.totalEquity),
    equityRatio: safeDivide(data.totalEquity, data.totalAssets),
    interestCoverage: safeDivide(data.ebit, data.interestExpense),
    financialLeverage: safeDivide(data.totalAssets, data.totalEquity),
  };
}

export function calculateEfficiencyRatios(data: NormalizedFinancialRecord): EfficiencyRatios {
  const cogs = data.cogs || (data.revenue - data.grossProfit);
  const revenue = data.revenue || 1;

  const inventoryTurnover = safeDivide(cogs, data.inventory);
  const arTurnover = safeDivide(revenue, data.accountsReceivable);
  const apTurnover = safeDivide(cogs, data.accountsPayable);

  return {
    assetTurnover: safeDivide(revenue, data.totalAssets),
    fixedAssetTurnover: safeDivide(revenue, data.fixedAssets),
    inventoryTurnover,
    dio: safeDivide(365, inventoryTurnover),
    arTurnover,
    dso: safeDivide(365, arTurnover),
    apTurnover,
    dpo: safeDivide(365, apTurnover),
    ccc: safeDivide(365, inventoryTurnover) + safeDivide(365, arTurnover) - safeDivide(365, apTurnover),
  };
}

export function calculateDuPont(data: NormalizedFinancialRecord): DuPontAnalysis {
  const netIncome = data.netIncome || (data.ebit - data.interestExpense - data.tax);
  const revenue = data.revenue || 1;
  const totalAssets = data.totalAssets || 1;
  const totalEquity = data.totalEquity || 1;

  const netProfitMargin = safeDivide(netIncome, revenue);
  const assetTurnover = safeDivide(revenue, totalAssets);
  const financialLeverage = safeDivide(totalAssets, totalEquity);
  const roe = netProfitMargin * assetTurnover * financialLeverage * 100;

  const total = netProfitMargin + assetTurnover + financialLeverage;

  return {
    roe,
    netProfitMargin: netProfitMargin * 100,
    assetTurnover,
    financialLeverage,
    npmContribution: total > 0 ? safeDivide(netProfitMargin, total) * 100 : 0,
    atoContribution: total > 0 ? safeDivide(assetTurnover, total) * 100 : 0,
    flContribution: total > 0 ? safeDivide(financialLeverage, total) * 100 : 0,
  };
}

export function calculateEarningsQuality(data: NormalizedFinancialRecord): EarningsQuality {
  const netIncome = data.netIncome || (data.ebit - data.interestExpense - data.tax);
  const ocf = data.operatingCashFlow;
  const totalAssets = data.totalAssets || 1;

  const accrualsRatio = safeDivide(netIncome - ocf, totalAssets) * 100;
  const cashToEarningsRatio = safeDivide(ocf, netIncome);

  // Sustainability score: higher cash-based earnings = higher quality
  let sustainabilityScore = 50;
  if (cashToEarningsRatio > 1.2) sustainabilityScore += 25;
  else if (cashToEarningsRatio > 0.8) sustainabilityScore += 10;
  else sustainabilityScore -= 15;

  if (Math.abs(accrualsRatio) < 5) sustainabilityScore += 15;
  else if (Math.abs(accrualsRatio) < 10) sustainabilityScore += 5;
  else sustainabilityScore -= 10;

  sustainabilityScore = Math.max(0, Math.min(100, sustainabilityScore));

  let quality: 'high' | 'moderate' | 'low';
  let description: string;

  if (sustainabilityScore >= 70) {
    quality = 'high';
    description = 'Earnings are well-supported by cash flows with low accruals. High confidence in sustainability.';
  } else if (sustainabilityScore >= 40) {
    quality = 'moderate';
    description = 'Earnings quality is acceptable but some accrual-based components present. Monitor cash conversion.';
  } else {
    quality = 'low';
    description = 'Significant gap between reported earnings and cash flows. Potential earnings quality concerns.';
  }

  return {
    accrualsRatio,
    cashToEarningsRatio,
    nonRecurringItems: 0,
    sustainabilityScore,
    quality,
    description,
  };
}

export function calculateCashFlowAnalysis(data: NormalizedFinancialRecord, previousData?: NormalizedFinancialRecord): CashFlowAnalysis {
  const ocf = data.operatingCashFlow;
  const icf = data.investingCashFlow;
  const fcf = data.operatingCashFlow - (data.capex || 0);

  // Calculate burn rate from operating cash flow (if negative)
  const monthlyBurn = ocf < 0 ? Math.abs(ocf) / 12 : 0;
  const runway = monthlyBurn > 0 ? safeDivide(data.cash, monthlyBurn) : 999;

  let liquidityRisk: 'safe' | 'caution' | 'danger';
  if (runway >= 12) liquidityRisk = 'safe';
  else if (runway >= 6) liquidityRisk = 'caution';
  else liquidityRisk = 'danger';

  const netIncome = data.netIncome || (data.ebit - data.interestExpense - data.tax);
  const totalExpenses = data.cogs + data.operatingExpenses + data.interestExpense + data.tax;
  const fundingDependency = totalExpenses > 0
    ? Math.max(0, (totalExpenses - Math.abs(ocf)) / totalExpenses * 100)
    : 0;

  return {
    ocf,
    icf,
    fcf,
    burnRate: monthlyBurn,
    monthsRunway: runway,
    liquidityRisk,
    fundingDependency: Math.min(100, fundingDependency),
    freeCashFlow: fcf,
    ocfToNetIncome: safeDivide(ocf, netIncome),
  };
}

export function calculateAltmanZScore(data: NormalizedFinancialRecord): AltmanZScore {
  const totalAssets = data.totalAssets || 1;
  const totalLiabilities = data.totalLiabilities || 1;
  const currentAssets = data.currentAssets || (data.cash + data.accountsReceivable + data.inventory);
  const currentLiabilities = data.currentLiabilities || data.accountsPayable || 1;

  const workingCapital = currentAssets - currentLiabilities;
  const retainedEarnings = data.retainedEarnings || (data.totalEquity * 0.3);
  const ebit = data.ebit || (data.revenue - data.cogs - data.operatingExpenses);

  const x1 = safeDivide(workingCapital, totalAssets);
  const x2 = safeDivide(retainedEarnings, totalAssets);
  const x3 = safeDivide(ebit, totalAssets);
  const x4 = safeDivide(data.totalEquity, totalLiabilities);
  const x5 = safeDivide(data.revenue, totalAssets);

  const zScore = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 0.999 * x5;

  let zone: 'safe' | 'grey' | 'distress';
  if (zScore > 2.99) zone = 'safe';
  else if (zScore > 1.81) zone = 'grey';
  else zone = 'distress';

  // Approximate probability based on zone
  let probability: number;
  if (zone === 'safe') probability = 0.01;
  else if (zone === 'grey') probability = 0.15;
  else probability = 0.45 + Math.max(0, (1.81 - zScore) * 0.05);

  return {
    zScore,
    zone,
    probability: Math.min(0.99, probability),
    components: { x1, x2, x3, x4, x5 },
  };
}

export function calculateBeneishMScore(
  current: NormalizedFinancialRecord,
  previous?: NormalizedFinancialRecord
): BeneishMScore {
  if (!previous) {
    return {
      mScore: -99,
      isManipulator: false,
      components: { dsri: 1, gmi: 1, aqi: 1, sgi: 1, depi: 1, sgai: 1, lvgi: 1, tata: 0 },
    };
  }

  const cRev = current.revenue || 1;
  const pRev = previous.revenue || 1;
  const cGross = (current.grossProfit) || (cRev - current.cogs);
  const pGross = (previous.grossProfit) || (pRev - previous.cogs);

  // DSRI: Days Sales Receivable Index
  const cDSR = safeDivide(current.accountsReceivable, cRev);
  const pDSR = safeDivide(previous.accountsReceivable, pRev);
  const dsri = safeDivide(cDSR, pDSR);

  // GMI: Gross Margin Index
  const cGMI = safeDivide(cRev - current.cogs, cRev);
  const pGMI = safeDivide(pRev - previous.cogs, pRev);
  const gmi = safeDivide(pGMI, cGMI);

  // AQI: Asset Quality Index
  const cAQI = 1 - safeDivide(current.currentAssets || 0, current.totalAssets || 1);
  const pAQI = 1 - safeDivide(previous.currentAssets || 0, previous.totalAssets || 1);
  const aqi = safeDivide(cAQI, pAQI);

  // SGI: Sales Growth Index
  const sgi = safeDivide(cRev, pRev);

  // DEPI: Depreciation Index
  const cDepRate = safeDivide(current.depreciation, current.fixedAssets + current.depreciation);
  const pDepRate = safeDivide(previous.depreciation, previous.fixedAssets + previous.depreciation);
  const depi = safeDivide(pDepRate, cDepRate);

  // SGAI: SGA Index
  const cSGA = safeDivide(current.operatingExpenses, cRev);
  const pSGA = safeDivide(previous.operatingExpenses, pRev);
  const sgai = safeDivide(cSGA, pSGA);

  // LVGI: Leverage Index
  const cLVG = safeDivide(current.totalLiabilities, current.totalAssets);
  const pLVG = safeDivide(previous.totalLiabilities, previous.totalAssets);
  const lvgi = safeDivide(cLVG, pLVG);

  // TATA: Total Accruals to Total Assets
  const cNetIncome = current.netIncome || (current.ebit - current.interestExpense - current.tax);
  const tata = safeDivide(cNetIncome - current.operatingCashFlow, current.totalAssets);

  const mScore = -4.84 + 0.92 * dsri + 0.528 * gmi + 0.404 * aqi + 0.892 * sgi +
    0.115 * depi - 0.172 * sgai + 4.679 * tata - 0.327 * lvgi;

  return {
    mScore,
    isManipulator: mScore > -2.22,
    components: { dsri, gmi, aqi, sgi, depi, sgai, lvgi, tata },
  };
}

// ==================== FORECASTING ENGINE ====================

function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
  const n = x.length;
  if (n < 2) return { slope: 0, intercept: y[0] || 0, r2: 0 };

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((s, xi, i) => s + xi * y[i], 0);
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const yMean = sumY / n;
  const ssTotal = y.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
  const ssResidual = y.reduce((s, yi, i) => s + (yi - (slope * x[i] + intercept)) ** 2, 0);
  const r2 = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

  return { slope, intercept, r2 };
}

export function generateForecasts(
  data: NormalizedFinancialRecord[],
  periods: number = 12
): Forecasts {
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);

  const extractSeries = (getter: (d: NormalizedFinancialRecord) => number): number[] =>
    data.map(getter);

  const revSeries = extractSeries(d => d.revenue);
  const profitSeries = extractSeries(d => d.netIncome || (d.ebit - d.interestExpense - d.tax));
  const ebitdaSeries = extractSeries(d => d.ebitda || (d.ebit + d.depreciation));
  const ocfSeries = extractSeries(d => d.operatingCashFlow);
  const cashSeries = extractSeries(d => d.cash);
  const wcSeries = extractSeries(
    d => (d.currentAssets || (d.cash + d.accountsReceivable + d.inventory)) - (d.currentLiabilities || d.accountsPayable || 0)
  );

  const createForecast = (series: number[], lastN: number = n): ForecastPoint[] => {
    const lastVal = series[series.length - 1] || 0;
    const { slope, intercept } = linearRegression(
      Array.from({ length: Math.min(series.length, lastN) }, (_, i) => i),
      series.slice(-lastN)
    );

    const std = Math.sqrt(
      series.reduce((s, v, i) => s + (v - (slope * i + intercept)) ** 2, 0) / Math.max(series.length - 1, 1)
    );

    return Array.from({ length: periods }, (_, i) => {
      const xVal = n + i;
      const predicted = slope * xVal + intercept;
      const margin = 1.96 * std * Math.sqrt(1 + 1 / n + (xVal - (n - 1) / 2) ** 2 / series.reduce((s, _, i) => s + (i - (n - 1) / 2) ** 2, 0));

      return {
        period: `M${i + 1}`,
        value: Math.max(0, predicted),
        lowerBound: Math.max(0, predicted - margin),
        upperBound: Math.max(0, predicted + margin),
      };
    });
  };

  return {
    revenue: createForecast(revSeries),
    profit: createForecast(profitSeries),
    ebitda: createForecast(ebitdaSeries),
    cashFlow: createForecast(ocfSeries),
    cashBalance: createForecast(cashSeries),
    workingCapital: createForecast(wcSeries),
  };
}

// ==================== SCENARIO ANALYSIS ====================

export function generateScenarios(data: NormalizedFinancialRecord): ScenarioAnalysis {
  const revenue = data.revenue || 1;
  const cogs = data.cogs || revenue * 0.6;
  const opex = data.operatingExpenses || revenue * 0.2;
  const cash = data.cash || 0;
  const currentAssets = data.currentAssets || (cash + data.accountsReceivable + data.inventory);
  const currentLiabilities = data.currentLiabilities || data.accountsPayable || 1;

  const baseRevenue = revenue;
  const baseProfit = data.netIncome || (revenue - cogs - opex - data.interestExpense - data.tax);
  const baseLiquidity = safeDivide(currentAssets, currentLiabilities);

  return {
    bestCase: {
      name: 'Best Case',
      revenueGrowth: 20,
      costChange: -10,
      projectedRevenue: baseRevenue * 1.2,
      projectedProfit: baseProfit * 1.4,
      projectedCash: cash + baseProfit * 1.2,
      projectedLiquidity: baseLiquidity * 1.15,
    },
    baseCase: {
      name: 'Base Case',
      revenueGrowth: 5,
      costChange: 0,
      projectedRevenue: baseRevenue * 1.05,
      projectedProfit: baseProfit * 1.05,
      projectedCash: cash + baseProfit,
      projectedLiquidity: baseLiquidity * 1.02,
    },
    worstCase: {
      name: 'Worst Case',
      revenueGrowth: -20,
      costChange: 10,
      projectedRevenue: baseRevenue * 0.8,
      projectedProfit: baseProfit * 0.6,
      projectedCash: Math.max(0, cash - Math.abs(baseProfit) * 0.3),
      projectedLiquidity: baseLiquidity * 0.85,
    },
  };
}

// ==================== BENCHMARKING ====================

export function generateBenchmarks(data: NormalizedFinancialRecord): BenchmarkComparison[] {
  const p = calculateProfitabilityRatios(data);
  const l = calculateLiquidityRatios(data);
  const s = calculateSolvencyRatios(data);
  const e = calculateEfficiencyRatios(data);

  const benchmarks: { metric: string; value: number; industryAvg: number }[] = [
    { metric: 'Net Margin', value: p.netMargin, industryAvg: 10 },
    { metric: 'Gross Margin', value: p.grossMargin, industryAvg: 35 },
    { metric: 'ROA', value: p.roa, industryAvg: 6 },
    { metric: 'ROE', value: p.roe, industryAvg: 12 },
    { metric: 'Current Ratio', value: l.currentRatio, industryAvg: 1.5 },
    { metric: 'Debt Ratio', value: s.debtRatio * 100, industryAvg: 50 },
    { metric: 'Asset Turnover', value: e.assetTurnover, industryAvg: 0.6 },
    { metric: 'Inventory Turnover', value: e.inventoryTurnover, industryAvg: 6 },
  ];

  return benchmarks.map(b => {
    const diff = b.value - b.industryAvg;
    const percentile = 50 + (diff / b.industryAvg) * 50;
    return {
      metric: b.metric,
      companyValue: b.value,
      industryAvg: b.industryAvg,
      percentile: Math.max(0, Math.min(100, percentile)),
      status: diff > 2 ? 'above' : diff < -2 ? 'below' : 'at',
    };
  });
}

// ==================== FINANCIAL SCORE ====================

export function calculateFinancialScore(
  profitability: ProfitabilityRatios,
  liquidity: LiquidityRatios,
  solvency: SolvencyRatios,
  efficiency: EfficiencyRatios,
  cashFlow: CashFlowAnalysis,
  earningsQuality: EarningsQuality,
  revenueGrowth: number
): FinancialScore {
  // Profitability score (0-100)
  const profScore = Math.min(100, Math.max(0,
    (profitability.netMargin > 0 ? 20 : 0) +
    (profitability.grossMargin > 20 ? 20 : profitability.grossMargin > 10 ? 10 : 0) +
    (profitability.roa > 5 ? 20 : profitability.roa > 2 ? 10 : 0) +
    (profitability.roe > 10 ? 20 : profitability.roe > 5 ? 10 : 0) +
    (profitability.ebitdaMargin > 15 ? 20 : profitability.ebitdaMargin > 8 ? 10 : 0)
  ));

  // Liquidity score
  const liqScore = Math.min(100, Math.max(0,
    liquidity.currentRatio > 2 ? 100 :
    liquidity.currentRatio > 1.5 ? 80 :
    liquidity.currentRatio > 1 ? 60 :
    liquidity.currentRatio > 0.8 ? 40 : 20
  ));

  // Solvency score
  const solScore = Math.min(100, Math.max(0,
    (solvency.debtRatio < 0.3 ? 40 : solvency.debtRatio < 0.5 ? 30 : solvency.debtRatio < 0.7 ? 15 : 5) +
    (solvency.debtToEquity < 0.5 ? 30 : solvency.debtToEquity < 1 ? 20 : solvency.debtToEquity < 2 ? 10 : 5) +
    (solvency.interestCoverage > 5 ? 30 : solvency.interestCoverage > 3 ? 20 : solvency.interestCoverage > 1 ? 10 : 5)
  ));

  // Efficiency score
  const effScore = Math.min(100, Math.max(0,
    (efficiency.assetTurnover > 0.8 ? 25 : efficiency.assetTurnover > 0.5 ? 15 : 5) +
    (efficiency.inventoryTurnover > 8 ? 25 : efficiency.inventoryTurnover > 4 ? 15 : 5) +
    (efficiency.dso < 45 ? 25 : efficiency.dso < 60 ? 15 : 5) +
    (efficiency.ccc < 30 ? 25 : efficiency.ccc < 60 ? 15 : 5)
  ));

  // Growth score
  const growthScore = Math.min(100, Math.max(0,
    revenueGrowth > 20 ? 100 :
    revenueGrowth > 10 ? 80 :
    revenueGrowth > 5 ? 60 :
    revenueGrowth > 0 ? 40 : 20
  ));

  // Cash flow score
  const cfScore = Math.min(100, Math.max(0,
    (cashFlow.ocf > 0 ? 30 : 0) +
    (cashFlow.freeCashFlow > 0 ? 30 : 0) +
    (cashFlow.monthsRunway > 12 ? 20 : cashFlow.monthsRunway > 6 ? 15 : 5) +
    (cashFlow.ocfToNetIncome > 0.8 ? 20 : cashFlow.ocfToNetIncome > 0.5 ? 10 : 5)
  ));

  // Earnings quality score
  const eqScore = earningsQuality.sustainabilityScore;

  // Weighted overall
  const overall = Math.round(
    profScore * 0.20 +
    liqScore * 0.15 +
    solScore * 0.15 +
    effScore * 0.10 +
    growthScore * 0.15 +
    cfScore * 0.15 +
    eqScore * 0.10
  );

  let label: string;
  if (overall >= 80) label = 'Excellent';
  else if (overall >= 60) label = 'Good';
  else if (overall >= 40) label = 'Needs Improvement';
  else label = 'High Risk';

  return {
    overall,
    profitability: profScore,
    liquidity: liqScore,
    solvency: solScore,
    efficiency: effScore,
    growth: growthScore,
    cashFlow: cfScore,
    earningsQuality: eqScore,
    label,
  };
}

// ==================== MAIN ANALYSIS FUNCTION ====================

export function analyzeFinancials(data: NormalizedFinancialRecord[]): ComprehensiveFinancials {
  if (data.length === 0) {
    throw new Error('No financial data provided');
  }

  // Use the most recent record for point-in-time ratios
  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : undefined;

  // Calculate all ratio categories
  const profitability = calculateProfitabilityRatios(latest);
  const liquidity = calculateLiquidityRatios(latest);
  const solvency = calculateSolvencyRatios(latest);
  const efficiency = calculateEfficiencyRatios(latest);
  const dupont = calculateDuPont(latest);
  const earningsQuality = calculateEarningsQuality(latest);
  const cashFlow = calculateCashFlowAnalysis(latest, previous);
  const altmanZ = calculateAltmanZScore(latest);
  const beneishM = calculateBeneishMScore(latest, previous);

  // Growth calculations
  const revenueGrowth = previous ? growthRate(latest.revenue, previous.revenue) : 0;
  const expenseGrowth = previous ? growthRate(
    latest.cogs + latest.operatingExpenses,
    previous.cogs + previous.operatingExpenses
  ) : 0;

  // Financial score
  const score = calculateFinancialScore(
    profitability, liquidity, solvency, efficiency, cashFlow, earningsQuality, revenueGrowth
  );

  // Forecasts
  const forecasts = generateForecasts(data, 12);

  // Scenarios
  const scenarioAnalysis = generateScenarios(latest);

  // Benchmarks
  const benchmarks = generateBenchmarks(latest);

  // Monthly data for charts
  const months = data.map(d => d.month || '').filter(Boolean);
  const monthlyRevenue = data.map(d => d.revenue);
  const monthlyExpenses = data.map(d => d.cogs + d.operatingExpenses + d.interestExpense + d.tax);
  const monthlyNetIncome = data.map(d => d.netIncome || (d.ebit - d.interestExpense - d.tax));
  const monthlyCash = data.map(d => d.cash);
  const monthlyAssets = data.map(d => d.totalAssets);
  const monthlyLiabilities = data.map(d => d.totalLiabilities);

  const netIncome = latest.netIncome || (latest.ebit - latest.interestExpense - latest.tax);

  return {
    totalRevenue: latest.revenue,
    totalExpenses: latest.cogs + latest.operatingExpenses + latest.interestExpense + latest.tax,
    netProfit: netIncome,
    netMargin: profitability.netMargin,
    revenueGrowth,
    expenseGrowth,

    totalAssets: latest.totalAssets,
    totalLiabilities: latest.totalLiabilities,
    totalEquity: latest.totalEquity,
    cash: latest.cash,
    inventory: latest.inventory,
    accountsReceivable: latest.accountsReceivable,
    accountsPayable: latest.accountsPayable,

    profitability,
    liquidity,
    solvency,
    efficiency,
    dupont,
    earningsQuality,
    cashFlow,
    altmanZ,
    beneishM,
    score,

    forecasts,
    scenarioAnalysis,
    benchmarks,

    months,
    monthlyRevenue,
    monthlyExpenses,
    monthlyNetIncome,
    monthlyCash,
    monthlyAssets,
    monthlyLiabilities,
  };
}
