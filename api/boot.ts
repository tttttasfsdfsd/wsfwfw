import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// File upload endpoint for financial analysis
app.post("/api/analyze", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const companyName = (formData.get("companyName") as string) || "My Company";

    if (!file) {
      return c.json({ success: false, error: "No file uploaded" }, 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let rawData: Record<string, unknown>[] = [];
    const isPDF = file.name.endsWith(".pdf");

    if (isPDF) {
      // PDF extraction
      try {
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
        const pdf = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: { str?: string }) => (item as { str: string }).str || "").join(" ") + "\n";
        }

        // Try to parse numbers from PDF text
        const lines = fullText.split("\n").filter((l) => l.trim());
        const numRegex = /[\d,]+\.?\d*/g;

        lines.forEach((line, i) => {
          const nums = line.match(numRegex);
          if (nums && nums.length >= 2) {
            const revenue = parseFloat(nums[0].replace(/,/g, "")) || 0;
            const expenses = parseFloat(nums[1].replace(/,/g, "")) || 0;
            if (revenue > 0) {
              rawData.push({
                month: `Period ${i + 1}`,
                revenue,
                expenses,
                assets: parseFloat(nums[2]?.replace(/,/g, "")) || revenue * 3,
                liabilities: parseFloat(nums[3]?.replace(/,/g, "")) || revenue * 1.5,
                cash: parseFloat(nums[4]?.replace(/,/g, "")) || revenue * 0.4,
                inventory: parseFloat(nums[5]?.replace(/,/g, "")) || revenue * 0.2,
                equity: parseFloat(nums[6]?.replace(/,/g, "")) || revenue * 1.5,
              });
            }
          }
        });
      } catch {
        return c.json(
          {
            success: false,
            error:
              "Could not extract data from PDF. Please use Excel format or ensure the PDF contains clear financial tables.",
          },
          400
        );
      }
    } else {
      // Excel parsing
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      rawData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
    }

    if (rawData.length === 0) {
      return c.json({ success: false, error: "File is empty or contains no readable data" }, 400);
    }

    // Semantic mapping and normalization
    const { mapFinancialColumns, normalizeFinancialData } = await import("../src/lib/semanticMapping");
    const { analyzeFinancials } = await import("../src/lib/financialEngine");

    const columns = Object.keys(rawData[0]);
    const mappings = mapFinancialColumns(columns);
    const normalizedData = normalizeFinancialData(rawData, mappings);
    const financials = analyzeFinancials(normalizedData);

    // Generate AI insights
    let insights: Array<{ type: string; title: string; text: string }> = [];
    try {
      if (env.anthropicApiKey && env.anthropicApiKey !== "sk-ant-api03-placeholder") {
        const Anthropic = await import("@anthropic-ai/sdk");
        const client = new Anthropic.default({ apiKey: env.anthropicApiKey });

        const prompt = `You are an expert financial analyst. Analyze this company data and provide 4 insights in JSON format:

Company: ${companyName}
Revenue: ${financials.totalRevenue.toLocaleString()} SAR
Net Profit: ${financials.netProfit.toLocaleString()} SAR (${financials.netMargin.toFixed(1)}% margin)
Current Ratio: ${financials.liquidity.currentRatio.toFixed(2)}
Debt Ratio: ${(financials.solvency.debtRatio * 100).toFixed(1)}%
ROA: ${financials.profitability.roa.toFixed(1)}% | ROE: ${financials.profitability.roe.toFixed(1)}%
Cash Runway: ${financials.cashFlow.monthsRunway.toFixed(1)} months
Score: ${financials.score.overall}/100

Respond with ONLY a JSON array (no markdown, no code blocks):
[
  {"type": "summary", "title": "Executive Summary", "text": "..."},
  {"type": "risk", "title": "Key Risks", "text": "..."},
  {"type": "opportunity", "title": "Opportunities", "text": "..."},
  {"type": "recommendation", "title": "Recommendations", "text": "..."}
]`;

        const response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        });

        const rawText = response.content[0]?.type === "text" ? response.content[0].text : "";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          insights = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      console.error("AI insights error:", e);
    }

    // Fallback insights if AI fails or no API key
    if (insights.length === 0) {
      const s = financials.score.overall;
      const isProfitable = financials.netProfit > 0;
      insights = [
        {
          type: "summary",
          title: "Executive Summary",
          text: `Financial score: ${s}/100. ${isProfitable ? `Net margin of ${financials.netMargin.toFixed(1)}% indicates ${financials.netMargin > 15 ? "strong" : financials.netMargin > 8 ? "moderate" : "weak"} profitability.` : "The company is currently reporting losses requiring urgent review."} Revenue growth at ${financials.revenueGrowth.toFixed(1)}%.`,
        },
        {
          type: "risk",
          title: "Key Risks",
          text: financials.solvency.debtRatio > 0.5
            ? `Elevated debt ratio (${(financials.solvency.debtRatio * 100).toFixed(1)}%) may limit financial flexibility. ${financials.cashFlow.monthsRunway < 6 ? `Critical: Only ${financials.cashFlow.monthsRunway.toFixed(1)} months of cash runway remaining.` : ""}`
            : `Debt levels are manageable. ${financials.cashFlow.monthsRunway < 6 ? `Watch cash runway at ${financials.cashFlow.monthsRunway.toFixed(1)} months.` : ""}`,
        },
        {
          type: "opportunity",
          title: "Opportunities",
          text: financials.revenueGrowth > 0
            ? `Revenue growing at ${financials.revenueGrowth.toFixed(1)}% shows positive trajectory. Consider scaling operations.`
            : `Opportunity to diversify revenue streams and improve pricing strategy.`,
        },
        {
          type: "recommendation",
          title: "Recommendations",
          text: `Monitor burn rate of ${financials.cashFlow.burnRate.toLocaleString()} SAR/month. ${financials.liquidity.currentRatio < 1.5 ? "Improve liquidity by accelerating collections or negotiating supplier terms." : "Maintain current liquidity management practices."}`,
        },
      ];
    }

    return c.json({
      success: true,
      financials,
      insights,
      rawData,
      companyName,
      isPDF,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      500
    );
  }
});

// tRPC handler
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

// Start server when run directly
const isMain = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` ||
               process.argv[1]?.endsWith('boot.ts') ||
               process.argv[1]?.endsWith('server.ts');

if (isMain || env.isProduction) {
  const { serve } = await import("@hono/node-server");
  
  if (env.isProduction) {
    const { serveStaticFiles } = await import("./lib/vite.js");
    serveStaticFiles(app);
  }

  const port = parseInt(process.env.API_PORT || process.env.PORT || "3001");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`✅ AI-CFO API Server running on http://localhost:${port}/`);
  });
}
