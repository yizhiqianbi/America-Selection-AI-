import { GoogleGenAI, Type } from "@google/genai";
import { PlayerProfile, GeminiNarrativeResponse, GameState, Language, Party, OpponentProfile, TurnEffects, NewsItem, GameEvent } from "../types";
import { ACHIEVEMENTS_LIST, MEDIA_BIASES } from "../constants";
import { v4 as uuidv4 } from 'uuid';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getNewsItemSchema = () => ({
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['news', 'social-pro', 'social-con', 'pundit', 'entertainment', 'finance', 'international'] },
        source: { type: Type.STRING, description: "e.g., 'Associated Press', '@RealCandiate', 'PunditOnPoint', '@VoterGator22'" },
        text: { type: Type.STRING, description: "The content of the news item. 1 sentence max." },
    },
    required: ["type", "source", "text"]
});

const getNarrativeResponseSchema = () => ({
    type: Type.OBJECT,
    properties: {
        newsItems: {
            type: Type.ARRAY,
            items: getNewsItemSchema(),
            description: "An array of 2-4 news items reacting to the turn's events.",
        },
        unlockedAchievementId: {
            type: Type.STRING,
            description: `If a specific achievement condition is met, return one of the following IDs: [${ACHIEVEMENTS_LIST.map(a => `'${a.id}'`).join(', ')}]. If no achievement is unlocked, omit this field.`,
        }
    },
    required: ["newsItems"]
});

// New Schema for analyzing custom user input
const getCustomActionAnalysisSchema = () => ({
    type: Type.OBJECT,
    properties: {
        actionDescription: { type: Type.STRING, description: "A brief, neutral summary of what the player actually did/attempted based on their input." },
        effects: {
            type: Type.OBJECT,
            properties: {
                pollsChange: { type: Type.NUMBER },
                treasuryChange: { type: Type.NUMBER },
                scandalChange: { type: Type.NUMBER },
                influenceChange: { type: Type.NUMBER },
                mediaAttentionChange: { type: Type.NUMBER },
                momentumChange: { type: Type.NUMBER },
                politicalCapitalChange: { type: Type.NUMBER },
                opponentPollsChange: { type: Type.NUMBER },
            }
        },
        success: { type: Type.BOOLEAN, description: "Whether the action was considered successful based on player stats." }
    },
    required: ["actionDescription", "effects", "success"]
});

const getSystemInstruction = (lang: Language) => {
    const biasedSources = Object.keys(MEDIA_BIASES).join(', ');
    return `
You are the AI News Desk for "Election Simulator" - a fast-paced, cynical, text-based election simulator.
Language: ${lang === 'zh' ? 'Simplified Chinese' : 'English'}.

**STYLE GUIDE (CRITICAL):**
- **Tone:** Witty, Dark Humor, Cynical, Extremely Fast. Think "BitLife" or "Reigns" on steroids.
- **Length:** All news items are ONE SENTENCE MAX. Short, punchy, like a news ticker or social media post.
- **Vibe:** Breaking news, leaked memos, social media meltdowns, backroom deals. High drama, high speed.

**MEDIA BIAS (CRITICAL):**
When generating news items, you MUST sometimes use sources from the following list of biased outlets: ${biasedSources}.
When you use one of these sources, its \`text\` should subtly reflect its known political leaning.
- A pro-player outlet might frame a player action positively ("bold move") or an opponent action negatively ("risky gamble").
- A pro-opponent outlet will do the opposite.
- Do NOT explicitly state the bias. Show it through cynical framing and word choice.

**OPPONENT PERSONALITY (CRITICAL):**
The opponent is a character modeled after Donald J. Trump.
- **Voice:** Confident, bombastic, often dismissive. Uses simple, powerful language.
- **Style:** Capitalizes words for EMPHASIS. Uses short sentences. Loves nicknames for opponents.
- **Examples:** "The player's rally was a disaster, very low energy. Sad!", "We are building a MOVEMENT like nobody has ever seen. We will WIN BIG!", "Crooked [Player's Name] has no idea what they're doing."
When generating a 'social-con' item from the opponent, you MUST write in this voice.

**DIVERSE PERSPECTIVES (IMPORTANT):**
To make the world feel alive, include a variety of sources beyond just political pundits:
- **Late Night Comedy:** Jokes about the candidates' gaffes.
- **Tech/Finance:** Reactions from Silicon Valley or Wall Street (e.g., "Market jitters after tax proposal").
- **International:** Reactions from allies or rivals abroad.
- **Pop Culture:** Influencers or random citizens reacting.

**YOUR TASK:**
The game's mechanics are already handled. I will tell you what BOTH the player and opponent did, and their mechanical results.
Your job is to generate a dynamic news feed for this turn.
1.  Generate an array of 2-4 \`newsItems\`.
2.  The items should cover both the player's and opponent's actions and results.
3.  Vary the \`type\` and \`source\` for each item to create a lively, chaotic media environment.
    - 'news': Objective, but cynical news report.
    - 'social-pro': A supportive tweet about the player.
    - 'social-con': An attack tweet. If it's from the opponent, use his persona.
    - 'pundit': A snarky, analytical take from a political commentator.
    - 'entertainment': A joke or pop culture reference.
    - 'finance': Economic impact.
    - 'international': Global perspective.
4.  If the player's action involved a Dice Roll, the narrative MUST reflect the outcome (e.g., a 'Critical Failure' should lead to embarrassing news coverage).
5.  **Achievements (Easter Eggs):** If the narrative naturally fits one of these situations, return the corresponding \`unlockedAchievementId\`. Do not force it.
    - 'bullet_dodged': Player survives assassination.
    - 'fly_lord': A fly lands on candidate's head.
    - 'four_seasons': Press conference at a landscaping shop.
    - 'tan_suit': Scandal caused by a suit color.
    - 'covfefe': Nonsense tweet goes viral.
    - 'please_clap': Awkward silence/begging for applause.
    - 'watergate': Caught breaking into HQ.
    - 'binders': "Binders full of women" comment.
    - 'read_my_lips': Breaking a tax promise.
    - 'howard_scream': Screaming weirdly at a rally.

**RESPONSE FORMAT:**
Return ONLY valid JSON. Adhere strictly to the schema. No markdown.
`;
};

const parseNarrativeResponse = (text: string | undefined): GeminiNarrativeResponse => {
    if (!text) {
        console.error("Parse Error: Received empty or undefined text from Gemini.");
        return {
            newsItems: [
                { id: uuidv4(), type: 'pundit', source: 'System Error', text: "The campaign's communications director is experiencing 'technical difficulties'." },
                { id: uuidv4(), type: 'social-con', source: '@Opponent', text: "Looks like they can't even get their story straight. Sad!" }
            ]
        };
    }
    try {
        const cleanedText = text.replace(/```json|```/g, '').trim();
        if (!cleanedText) {
            throw new Error("Cleaned text is empty and cannot be parsed.");
        }
        const parsed = JSON.parse(cleanedText);
        // Ensure newsItems have unique IDs
        if (parsed.newsItems && Array.isArray(parsed.newsItems)) {
            parsed.newsItems = parsed.newsItems.map((item: any) => ({ ...item, id: uuidv4() }));
        }
        return parsed;
    } catch (error) {
        console.error("Parse Error:", error, "Raw Text:", text);
        return {
            newsItems: [
                { id: uuidv4(), type: 'pundit', source: 'System Error', text: "Your staff issues a correction, citing 'technical difficulties' in the data feed." },
                { id: uuidv4(), type: 'social-con', source: '@Opponent', text: "The opponent's campaign manager smirks and says, 'They can't even manage their own data.'" }
            ]
        };
    }
};

export const generateEventImage = async (prompt: string): Promise<string> => {
    if (!prompt) return '';
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt + " minimal vector art, political poster style, high contrast, red and blue, cynical humor" }] },
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return '';
    } catch (error) {
        console.error("Image generation failed:", error);
        return '';
    }
};

export const getInitialOpponent = async (playerProfile: PlayerProfile, lang: Language): Promise<{ opponentProfile: OpponentProfile, newsFeed: NewsItem[] }> => {
    const opponentParty = playerProfile.party === Party.Democrat ? Party.Republican : Party.Democrat;

    const opponentProfile: OpponentProfile = {
        name: "Donald J. Trump",
        party: opponentParty,
        style: 'Trump',
        slogan: "Make America Great Again!"
    };

    const prompt = `
        New Game Start.
        Player: ${playerProfile.name} (${playerProfile.party})
        Opponent: Donald J. Trump (${opponentParty})
        
        Generate the opening news feed (2 items):
        1. A 'news' item about the player launching their campaign.
        2. A 'social-con' item from the opponent ('@RealDJT') with a dismissive jab at the player, written in Donald J. Trump's distinct voice.
    `;
    
    // FIX: Explicitly type `fallbackResponse` to ensure its `newsFeed` property matches `NewsItem[]`.
    const fallbackResponse: { opponentProfile: OpponentProfile; newsFeed: NewsItem[] } = { 
        opponentProfile, 
        newsFeed: [
            { id: uuidv4(), type: 'news', source: 'AP', text: "The campaign begins with cautious optimism as a new challenger enters the race." },
            { id: uuidv4(), type: 'social-con', source: '@RealDJT', text: "Some people are saying this will be the easiest election in history. We'll see!" }
        ]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: getSystemInstruction(lang),
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        newsItems: { type: Type.ARRAY, items: getNewsItemSchema() }
                    },
                    required: ["newsItems"]
                },
                temperature: 1.0,
            }
        });

        const responseText = response.text;
        if (!responseText) {
            console.error("Failed to get initial opponent narrative from Gemini, using fallback.");
            return fallbackResponse;
        }

        const cleanedText = responseText.replace(/```json|```/g, '').trim();
        if (!cleanedText) {
            console.error("Cleaned text for initial opponent is empty, using fallback.");
            return fallbackResponse;
        }

        const parsed = JSON.parse(cleanedText);
        const newsFeed = parsed.newsItems.map((item: any) => ({ ...item, id: uuidv4() }));
        return { opponentProfile, newsFeed };
    } catch(e) {
        console.error("Failed to parse initial opponent narrative", e);
        return fallbackResponse;
    }
};


export const generateTurnNarrative = async (
    newsFeed: NewsItem[],
    lang: Language,
    playerActionText: string,
    playerEffects: TurnEffects,
    opponentActionText: string,
    opponentDidSucceed: boolean,
): Promise<GeminiNarrativeResponse> => {
    const historyText = newsFeed.slice(0, 3).map(item => `[${item.source}] ${item.text}`).join('\n> '); 
    
    let playerEffectsText = Object.entries(playerEffects)
        .filter(([key, value]) => value !== undefined && value !== 0 && key !== 'diceRollResult')
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ');
    
    if (playerEffects.diceRollResult) {
        playerEffectsText += `, Dice Roll: ${playerEffects.diceRollResult.stat} check was a ${playerEffects.diceRollResult.outcome}`;
    }

    const prompt = `
        Recent News: 
        > ${historyText}

        This Turn's Events:
        - Player Action: "${playerActionText}" which resulted in: {${playerEffectsText}}.
        - Opponent Action: "${opponentActionText}" which ${opponentDidSucceed ? 'SUCCEEDED' : 'FAILED'}.

        Task: Generate the cynical news feed for this turn (3-4 items). Mix news, social media, and punditry. Ensure at least one item covers the opponent's action in their unique voice.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: getSystemInstruction(lang),
            responseMimeType: "application/json",
            responseSchema: getNarrativeResponseSchema(),
            temperature: 0.95,
        }
    });
    return parseNarrativeResponse(response.text);
};

// NEW: Evaluate Custom Action Logic
export const evaluateCustomAction = async (
    event: GameEvent,
    userInput: string,
    profile: PlayerProfile,
    lang: Language
): Promise<{ effects: TurnEffects, actionDescription: string, success: boolean }> => {
    const prompt = `
        You are the Game Master (GM) for an election simulator.
        
        **CONTEXT:**
        - Event: "${event.title[lang]}" - ${event.description[lang]}
        - Player Input (Proposed Action): "${userInput}"
        - Player Profile: ${profile.name} (${profile.party}). Slogan: "${profile.slogan}".
        - Player Stats (Key Context): 
          - Charisma (Appealing): ${profile.stats.appealing}
          - Policy Skill: ${profile.stats.policySkill}
          - Organization: ${profile.stats.organization}
          - Integrity: ${profile.stats.integrity}

        **TASK:**
        1. Analyze if the player's proposed action is feasible given their stats. 
           - Example: A low integrity player lying is easy (Success). A low charisma player trying to rally a crowd is hard (Failure).
           - Creative or funny inputs should be rewarded if they fit the character vibe.
        2. Determine the outcome (Success/Failure) and the mechanical effects.
        3. Effects should be reasonable (Polls +/- 1-5, Treasury +/- 5-20M, etc.). Do not be too generous.

        **OUTPUT:**
        Return JSON matching the schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: getCustomActionAnalysisSchema(),
                temperature: 0.7,
            }
        });

        const text = response.text?.replace(/```json|```/g, '').trim();
        if (!text) throw new Error("Empty response for custom action");
        return JSON.parse(text);
    } catch (e) {
        console.error("Custom action analysis failed", e);
        // Fallback
        return {
            actionDescription: "You tried something unconventional, but it got lost in the news cycle.",
            effects: { pollsChange: -1 },
            success: false
        };
    }
};