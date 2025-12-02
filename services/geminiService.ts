import { GoogleGenAI } from "@google/genai";
import { SafetyReport, ComparisonReport, ApiResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

const CACHE_KEY_PREFIX = 'startup_safety_cache_v3_'; // Incremented version for new field
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const generateSafetyReport = async (query: string): Promise<ApiResponse> => {
  const normalizedKey = query.trim().toLowerCase();
  const cacheKey = `${CACHE_KEY_PREFIX}${normalizedKey}`;

  // 1. Check Cache
  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const { timestamp, payload } = JSON.parse(cachedItem);
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        console.log(`[Cache Hit] Serving cached report for: ${query}`);
        return payload;
      } else {
        localStorage.removeItem(cacheKey); // Expired
      }
    }
  } catch (e) {
    console.warn("Error reading from cache:", e);
  }

  try {
    const prompt = `
    ### SYSTEM ROLE
    You are the **Startup Career Guide (v7.0)**. Your job is to help people make safe career decisions by analyzing startups.

    ### INSTRUCTIONS
    1. **Search**: Use the 'googleSearch' tool to find real-time data about the input query: "${query}".
    2. **Detect Mode**:
       - **Single Mode**: If the user asks about one company (e.g., "Stripe"), generate a detailed deep-dive report.
       - **Battle Mode**: If the user compares multiple companies (e.g., "Stripe vs Uber" or "Ramp vs Brex vs Navan"), generate a comparison "Battle Table".
    3. **Consistency**: Use a consistent scoring rubric. For similar financial and market conditions, ensure the Stability Score is reproducible.

    ### JSON RESPONSE FORMAT
    You must return a **strictly valid JSON object** with one of the following structures based on the detected mode. Do not include markdown formatting like \`\`\`json.

    ---
    #### OPTION A: SINGLE MODE (One Company)
    {
      "mode": "single",
      "report": {
        "companyProfile": {
           "name": "string (Company Name)",
           "founded": "string (Year)",
           "location": "string (City, Country)",
           "product": "string (1-sentence summary)",
           "useCase": "string (Major use case)",
           "lastFunding": "string (e.g. 'Oct 2023 - $50M - Series B')"
        },
        "stabilityScore": {
           "score": number (0-100),
           "riskLevel": "Low" | "Medium" | "High",
           "verdict": "Strong Buy" | "Reasonable Bet" | "Caution"
        },
        "careerImpact": {
           "learning": "High" | "Med" | "Low",
           "brand": "High" | "Med" | "Low",
           "wlb": "High" | "Med" | "Low",
           "jobSecurity": "High" | "Med" | "Low",
           "compUpside": "High" | "Med" | "Low",
           "visaSafety": "High" | "Med" | "Low"
        },
        "summary": {
           "upside": "string (Key Pro)",
           "redFlags": "string (Key Risk)",
           "unknowns": "string (Missing Data)",
           "guardianTake": "string (1-sentence advice)"
        },
        "recommendedReads": [
           {
             "title": "string (e.g., 'CEO Interview on The Verge' or 'Engineering Culture Blog')",
             "uri": "string",
             "source": "string (e.g., 'Youtube', 'Substack', 'TechCrunch')",
             "summary": "string (One sentence on why a candidate must read this before an interview)"
           }
        ],
        "pillars": [
           {
             "id": 1,
             "title": "Money & Survival Time",
             "weight": "25%",
             "status": "Green" | "Yellow" | "Red",
             "summary": "string (Short verdict)",
             "details": {
                "Cash Left in the Bank": "string (e.g. 18 months)",
                "How Fast are They Burning Cash?": "string (Unknown or Value)",
                "Recent Layoffs (Last 12 Months)": "string (Yes/No + details)"
             },
             "revenueData": [ 
               // Optional: Include revenue history since product launch.
               // 'revenue' should be a number in Millions USD.
               { "year": "2021", "revenue": 10 }
             ]
           },
           // ... (Include all 10 pillars as per standard single report structure)
           // Pillar IDs: 
           // 1: Money, 2: Big Tech Risk, 3: Team Stability, 4: WLB, 5: Comp & Equity, 
           // 6: Founder Competence (include founderSocials & founderContent), 
           // 7: Do People Like Product (include userBaseData), 
           // 8: Tech Debt, 9: Market Opp, 10: Manager Quality
           {
             "id": 6,
             "title": "Founder Competence",
             "weight": "7%",
             "status": "Green" | "Yellow" | "Red",
             "summary": "string",
             "details": { "Founder": "string", "Background": "string" },
             "founderSocials": [{ "platform": "LinkedIn", "uri": "string" }],
             "founderContent": [{ "title": "string", "uri": "string", "source": "string" }]
           },
           {
             "id": 7,
             "title": "Do People Like the Product?",
             "weight": "5%",
             "status": "Green" | "Yellow" | "Red",
             "summary": "string",
             "details": { "Customers": "string", "Real User Feedback": "string" },
             "userBaseData": [{ "year": "string", "users": number }]
           }
           // ... ensure all 10 are present in output if single mode
        ],
        "transparency": {
           "penalty": number,
           "missingData": ["string"]
        },
        "visaSafety": {
           "h1bSponsor": "Yes" | "No" | "Unsure",
           "greenCard": "Yes" | "No" | "Unsure",
           "eVerify": "Yes" | "No" | "Unsure"
        }
      }
    }

    ---
    #### OPTION B: BATTLE MODE (Comparison)
    {
      "mode": "battle",
      "comparison": {
        "companies": ["Company A", "Company B", ...],
        "rows": [
           {
             "feature": "Money Left",
             "companyValues": { "Company A": "18 mo runway", "Company B": "Profitable" },
             "winner": "Company B"
           },
           {
             "feature": "Visa Help",
             "companyValues": { "Company A": "Sponsors H1B", "Company B": "No Sponsorship" },
             "winner": "Company A"
           },
           {
             "feature": "Salary",
             "companyValues": { "Company A": "Top 10%", "Company B": "Market Rate" },
             "winner": "Company A"
           },
           {
             "feature": "WLB",
             "companyValues": { "Company A": "Burnout Central", "Company B": "9-to-5" },
             "winner": "Company B"
           },
           {
             "feature": "Stability Score",
             "companyValues": { "Company A": "65/100", "Company B": "85/100" },
             "winner": "Company B"
           }
        ],
        "guardianVerdict": "string (A short paragraph declaring the winner and explaining why based on career safety and upside.)"
      }
    }

    ---
    #### OPTION C: AMBIGUOUS
    {
       "mode": "ambiguous",
       "isAmbiguous": true,
       "ambiguousOptions": ["Option A", "Option B"]
    }
    `;

    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let outputText = result.text;
    if (!outputText) throw new Error("No response from AI");

    // Clean up potential markdown code blocks
    outputText = outputText.replace(/```json\n?|\n?```/g, "").trim();
    
    // Extract JSON substring if needed
    const jsonStartIndex = outputText.indexOf('{');
    const jsonEndIndex = outputText.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        outputText = outputText.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    let parsedData;
    try {
        parsedData = JSON.parse(outputText);
    } catch (e) {
        console.error("Failed to parse JSON:", outputText);
        throw new Error("AI returned invalid JSON format.");
    }

    // Extract sources
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    let responsePayload: ApiResponse;

    if (parsedData.mode === 'ambiguous' || parsedData.isAmbiguous) {
       responsePayload = {
         mode: 'ambiguous',
         data: {
           isAmbiguous: true,
           options: parsedData.ambiguousOptions || [],
           originalQuery: query
         }
       };
    } else if (parsedData.mode === 'battle') {
       responsePayload = {
         mode: 'battle',
         data: {
           ...parsedData.comparison,
           sources
         }
       };
    } else {
       // Default to single mode even if mode missing for backward compatibility/safety
       responsePayload = {
         mode: 'single',
         data: {
           ...parsedData.report,
           sources
         }
       };
    }

    // 2. Save to Cache
    try {
      const cacheObject = {
        timestamp: Date.now(),
        payload: responsePayload
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
    } catch (e) {
      console.warn("Failed to save report to cache:", e);
    }

    return responsePayload;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};