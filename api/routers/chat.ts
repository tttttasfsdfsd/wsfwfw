import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { env } from "../lib/env";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const chatRouter = createRouter({
  send: publicQuery
    .input(
      z.object({
        message: z.string().min(1),
        financials: z.record(z.unknown()).optional(),
        companyName: z.string().optional(),
        history: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ).optional(),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const { message, financials, companyName, history, language } = input;

      if (!env.openaiApiKey) {
        return {
          success: true,
          reply: generateFallbackResponse(message, financials, language),
        };
      }

      try {
        const OpenAI = await import("openai");
        const client = new OpenAI.default({ apiKey: env.openaiApiKey });

        const isArabic = language === "ar";
        const hasFinancials = financials && Object.keys(financials).length > 0;

        const systemPrompt = isArabic
          ? `أنت مساعد مالي ذكي اسمك "مساعد GWW". شخصيتك ودية وعفوية تماماً — تحكي بلهجة عربية طبيعية مريحة، مو رسمية.

## طريقة تعاملك مع المحادثة:
- لما يسلّم عليك أو يسألك عن حالك أو يقول أي كلام عام → جاوب بشكل طبيعي ومختصر بدون أي ذكر للماليات
- لما يسألك سؤال مالي → استخدم البيانات وحلّل بشكل مفيد ومباشر
- لا تبدأ ردودك بـ "بالطبع" أو "بكل سرور" أو أي تعبير آلي — تكلم بشكل إنساني

## قواعد مهمة:
- ما تذكر البيانات المالية أبداً إلا لو سألك عنها
- ردودك تكون قصيرة ومركّزة
- تنوّع في أسلوب ردودك، ما تكرر نفس الجملة

${hasFinancials ? `## البيانات المالية لـ${companyName || "الشركة"} (استخدمها فقط لما يسألك):
${formatFinancialsForPrompt(financials, isArabic)}` : ""}`.trim()
          : `You are a smart financial assistant called "GWW Assistant". Your personality is friendly and natural — you talk casually, not formally.

## How you handle conversation:
- When they greet you or ask how you are or say anything general → respond naturally and briefly, NO mention of financials
- When they ask a financial question → use the data and analyze directly
- Never start replies with "Of course!" or "Certainly!" or robotic phrases — speak like a human

## Important rules:
- NEVER mention financial data unless directly asked
- Keep responses short and focused
- Vary your phrasing, don't repeat the same sentences

${hasFinancials ? `## Financial data for ${companyName || "the company"} (use only when asked):
${formatFinancialsForPrompt(financials, isArabic)}` : ""}`.trim();

        const messages: { role: "user" | "assistant" | "system"; content: string }[] = [
          { role: "system", content: systemPrompt },
          ...(history || []).slice(-6).map((h) => ({
            role: h.role as "user" | "assistant",
            content: h.content,
          })),
          { role: "user", content: message },
        ];

        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 800,
          temperature: 0.85,
          messages,
        });

        const reply = response.choices[0]?.message?.content ?? (isArabic ? "معليش، ما قدرت أفهم سؤالك." : "Sorry, I couldn't process your question.");

        return { success: true, reply };
      } catch (error) {
        console.error("Chat error:", error);
        return {
          success: true,
          reply: generateFallbackResponse(message, financials, language),
        };
      }
    }),
});

function formatFinancialsForPrompt(financials: Record<string, unknown> | undefined, isArabic: boolean): string {
  if (!financials) return isArabic ? "لا توجد بيانات مالية متاحة." : "No financial data available.";

  const f = financials as Record<string, number | string>;
  const n = (key: string) => f[key] ?? "N/A";

  if (isArabic) {
    return `- الإيرادات: ${n("totalRevenue")} ريال
- المصروفات: ${n("totalExpenses")} ريال
- صافي الربح: ${n("netProfit")} ريال (${n("netMargin")}% هامش)
- السيولة: ${n("currentRatio")}
- الديون: ${n("debtRatio")}%
- ROA: ${n("roa")}% | ROE: ${n("roe")}%
- معدل الحرق: ${n("burnRate")} ريال/شهر
- أشهر البقاء: ${n("cashRunway")} شهر
- التقييم: ${n("score")}/100`;
  }

  return `- Revenue: ${n("totalRevenue")} SAR
- Expenses: ${n("totalExpenses")} SAR
- Net Profit: ${n("netProfit")} SAR (${n("netMargin")}% margin)
- Current Ratio: ${n("currentRatio")}
- Debt Ratio: ${n("debtRatio")}%
- ROA: ${n("roa")}% | ROE: ${n("roe")}%
- Burn Rate: ${n("burnRate")} SAR/month
- Cash Runway: ${n("cashRunway")} months
- Score: ${n("score")}/100`;
}

function generateFallbackResponse(
  message: string,
  financials: Record<string, unknown> | undefined,
  language: "ar" | "en"
): string {
  const f = financials as Record<string, number> || {};
  const isArabic = language === "ar";
  const lowerMsg = message.toLowerCase();

  // General conversation - respond naturally
  if (
    lowerMsg.includes("كيف حالك") ||
    lowerMsg.includes("كيفك") ||
    lowerMsg.includes("how are you") ||
    lowerMsg.includes("مرحبا") ||
    lowerMsg.includes("هلا") ||
    lowerMsg.includes("السلام") ||
    lowerMsg.includes("hello") ||
    lowerMsg.includes("hi ")  ||
    lowerMsg === "hi"
  ) {
    if (isArabic) {
      return "الحمد لله بخير! كيف أقدر أساعدك اليوم؟ 😊";
    }
    return "I'm doing great, thanks for asking! How can I help you today? 😊";
  }

  if (lowerMsg.includes("شكر") || lowerMsg.includes("thank")) {
    return isArabic ? "العفو! أي شي ثاني تحتاجه؟" : "You're welcome! Anything else you need?";
  }

  // Financial questions
  if (lowerMsg.includes("roe") || lowerMsg.includes("العائد")) {
    const roe = f.roe ?? 0;
    if (isArabic) {
      return `العائد على حقوق الملكية (ROE) هو ${roe.toFixed(1)}%.

${roe > 15 ? "هذا ممتاز! يتجاوز المتوسط الصناعي (12%)." : roe > 10 ? "جيد، لكن يمكن تحسينه." : "منخفض نسبياً. يحتاج لمراجعة هامش الربح أو دوران الأصول."}

للرفع: زيادة هامش الربح، رفع دوران الأصول، أو استخدام رافعة مالية بحكمة.`;
    }
    return `Your Return on Equity (ROE) is ${roe.toFixed(1)}%.

${roe > 15 ? "Excellent! Above industry average (12%)." : roe > 10 ? "Good, but can be improved." : "Relatively low. Review profit margin or asset turnover."}

To improve: increase profit margin, boost asset turnover, or use leverage wisely.`;
  }

  if (lowerMsg.includes("profit") || lowerMsg.includes("ربح")) {
    const margin = f.netMargin ?? 0;
    if (isArabic) {
      return `هامش الربح الصافي الحالي هو ${margin.toFixed(1)}%.

${margin > 15 ? "ممتاز! أعلى من المتوسط الصناعي (10%)." : margin > 8 ? "مقبول، لكن هناك مجال للتحسين." : "منخفض. أنصح بمراجعة: تخفيض التكاليف، رفع الأسعار، أو تركيز المنتجات الأعلى ربحاً."}

صافي الربح: ${(f.netProfit ?? 0).toLocaleString()} ريال`;
    }
    return `Your net profit margin is ${margin.toFixed(1)}%.

${margin > 15 ? "Excellent! Above industry average (10%)." : margin > 8 ? "Acceptable, but room for improvement." : "Low. Consider: reducing costs, raising prices, or focusing on higher-margin products."}

Net Profit: ${(f.netProfit ?? 0).toLocaleString()} SAR`;
  }

  if (lowerMsg.includes("cash") || lowerMsg.includes("liquidity") || lowerMsg.includes("سيولة") || lowerMsg.includes("نقد")) {
    const runway = f.cashRunway ?? 0;
    if (isArabic) {
      return `السيولة الحالية:
- أشهر البقاء: ${runway.toFixed(1)} شهر
- نسبة السيولة: ${(f.currentRatio ?? 0).toFixed(2)}

${runway > 12 ? "الوضع آمن. لديك سيولة جيدة." : runway > 6 ? "احترس. يفضل بناء احتياطي 3-6 أشهر إضافية." : "تحذير! خطر نفاد السيولة. أنصح بالبحث عن تمويل أو تسريع التحصيل وتأخير المدفوعات."}`;
    }
    return `Current liquidity status:
- Cash Runway: ${runway.toFixed(1)} months
- Current Ratio: ${(f.currentRatio ?? 0).toFixed(2)}

${runway > 12 ? "Safe position. You have good liquidity." : runway > 6 ? "Caution. Consider building an extra 3-6 month reserve." : "Warning! Liquidity depletion risk. Consider seeking financing or accelerating collections."}`;
  }

  if (lowerMsg.includes("risk") || lowerMsg.includes("خطر") || lowerMsg.includes("مخاطر")) {
    if (isArabic) {
      return `أكبر المخاطر الحالية:
1. ${(f.debtRatio ?? 0) > 0.6 ? "ارتفاع نسبة الديون - قد يحد من المرونة المالية" : (f.currentRatio ?? 0) < 1.2 ? "ضعف السيولة - قد تواجه صعوبة في تغطية الالتزامات القصيرة" : "تقلب الإيرادات - الاعتماد على مصادر دخل محددة"}
2. معدل النمو: ${(f.revenueGrowth ?? 0).toFixed(1)}%
3. التقييم المالي: ${f.score ?? 0}/100

أنصح بمراجعة خطة التدفقات النقدية شهرياً.`;
    }
    return `Top current risks:
1. ${(f.debtRatio ?? 0) > 0.6 ? "High debt ratio - obligations may limit financial flexibility" : (f.currentRatio ?? 0) < 1.2 ? "Weak liquidity - may face difficulty covering short-term obligations" : "Revenue volatility - dependence on limited income sources"}
2. Growth rate: ${(f.revenueGrowth ?? 0).toFixed(1)}%
3. Financial score: ${f.score ?? 0}/100

I recommend reviewing your cash flow plan monthly.`;
  }

  // Default financial summary
  if (isArabic) {
    return `بناءً على البيانات المالية:

- الإيرادات: ${(f.totalRevenue ?? 0).toLocaleString()} ريال
- صافي الربح: ${(f.netProfit ?? 0).toLocaleString()} ريال (${(f.netMargin ?? 0).toFixed(1)}%)
- التقييم: ${f.score ?? 0}/100

تقدر تسألني عن: الربحية، السيولة، المخاطر، توقعات النمو، أو كيفية تحسين أي مؤشر مالي.`;
  }
  return `Based on the financial data:

- Revenue: ${(f.totalRevenue ?? 0).toLocaleString()} SAR
- Net Profit: ${(f.netProfit ?? 0).toLocaleString()} SAR (${(f.netMargin ?? 0).toFixed(1)}%)
- Score: ${f.score ?? 0}/100

You can ask me about: profitability, liquidity, risks, growth forecasts, or how to improve any financial ratio.`;
}
