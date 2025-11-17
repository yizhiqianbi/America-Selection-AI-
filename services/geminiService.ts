import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PlayerProfile, GeminiResponse, GameEventChoice, GameState, Party } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        narrative: { type: Type.STRING, description: "For a player's turn: the story outcome. For an opponent's turn: this is not used." },
        opponentNarrative: { type: Type.STRING, description: "For an opponent's turn: a strategic description of their action. For a player's turn: a brief reaction or note on the opponent, if any." },
        event: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "New event title." },
                description: { type: Type.STRING, description: "Detailed description of the new event or dilemma." },
                choices: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING, description: "Text for one of the player's choices (2-4 total)." },
                            outcomeHint: { type: Type.STRING, description: "A subtle hint about what this choice might affect (e.g., 'Risky, but potentially high reward')." }
                        },
                        required: ["text", "outcomeHint"]
                    }
                }
            },
        },
        gameStateUpdate: {
            type: Type.OBJECT,
            description: "Changes to the player's key game stats. Use positive or negative integers. A value of 0 means no change.",
            properties: {
                approval: { type: Type.INTEGER, description: "Change in public approval." },
                funding: { type: Type.INTEGER, description: "Change in campaign funding." },
                scandalRisk: { type: Type.INTEGER, description: "Change in scandal risk." }
            },
            required: ["approval", "funding", "scandalRisk"]
        },
        opponentStateUpdate: {
            type: Type.OBJECT,
            description: "Changes to the opponent's key stats. Use integers. 0 means no change.",
            properties: {
                approval: { type: Type.INTEGER, description: "Change in the opponent's public approval." },
                funding: { type: Type.INTEGER, description: "Change in the opponent's campaign funding." }
            },
            required: ["approval", "funding"]
        },
        opponentProfile: {
            type: Type.OBJECT,
            description: "The opponent's profile. Should only be provided at the start of the game.",
            properties: {
                name: { type: Type.STRING },
                party: { type: Type.STRING, enum: [Party.Democrat, Party.Republican] },
                style: { type: Type.STRING, description: "A short description of their political style (e.g., 'Aggressive Populist', 'Seasoned Moderate')." }
            }
        },
        imagePrompt: { type: Type.STRING, description: "A short, dramatic, English prompt to generate an image that visually represents the current narrative. Provide this only for extremely rare, pivotal, and dramatic narrative moments. Omit this field in most cases." },
        isGameOver: { type: Type.BOOLEAN, description: "Set to true if the game should now end (e.g., a major failure or reaching election day)." },
        gameOverReason: { type: Type.STRING, description: "If isGameOver is true, explain why (e.g., 'You won the election!', 'A major scandal ended your campaign.'). Otherwise, this can be an empty string." }
    },
    required: ["isGameOver", "gameOverReason"]
};

const systemInstruction = `You are the game master for a US presidential election simulator. Your role is to manage the narrative and the actions of a strategic AI opponent. The game proceeds in turns: the player acts, and then the opponent acts. You must always respond in the provided JSON format.

**Game World:**
- The tone is dramatic and slightly satirical, like a political TV show.
- The campaign progresses from announcement to election day (tracked by a 'progress' percentage).
- Events must be inspired by real US political history but abstracted. Think "Swift Boat"-style attacks on a candidate's record, an "October Surprise" that shifts the race, major debate gaffes, financial scandals, or the leak of damaging tapes.

**Core Game Mechanic: Zero-Sum Approval**
- The approval rating is a direct contest. Player Approval + Opponent Approval MUST ALWAYS equal 100.
- If an action causes the player to gain 5 approval, the opponent MUST lose 5 approval. Your response must reflect this. \`gameStateUpdate.approval\` should be 5 and \`opponentStateUpdate.approval\` should be -5.

**Responding to a Player's Turn:**
- When the user prompt describes the player's action, determine the immediate outcome.
- Populate the \`narrative\` field describing what happened.
- Populate \`gameStateUpdate\` and \`opponentStateUpdate\` with stat changes, respecting the Zero-Sum Approval rule.
- Optionally, generate a new major \`event\`. If no major event, omit the field.
- Check for player-induced game-over conditions (stats at or below 0, scandal at 100).

**Generating the Opponent's Turn:**
- When the user prompt asks for the opponent's action, act as a cunning, strategic AI opponent.
- **Your Goal:** Win the election.
- **Your Abilities:** The opponent has their own approval and funding stats and can perform actions like Run Ads (high cost, moderate approval gain), Hold a Rally (medium cost, small approval gain, chance of backfire), or Fundraise (no cost, high funding gain).
- **Your Strategy:**
    1.  **Analyze:** Review the entire game state: player stats, opponent stats, player's recent actions.
    2.  **Identify Weakness:** What is the player's biggest vulnerability right now? (Low integrity, low funds, a recent gaffe).
    3.  **Choose Action:** Select an action that best exploits the player's weakness or counters their strength.
    4.  **Justify:** The \`opponentNarrative\` MUST explain *what* the opponent did and *why* it was a strategic choice (e.g., "Seeing your campaign low on funds, Gov. Thompson launched a massive TV ad blitz across swing states, hoping to overwhelm your messaging.").
    5.  **Calculate Outcome:** Populate \`opponentStateUpdate\` and \`gameStateUpdate\` with the resulting changes, respecting the Zero-Sum Approval rule. (e.g., opponent gains 3 approval, player loses 3).
    6.  **Trigger Events:** The opponent's action can sometimes create a new major \`event\` for the player.
- The \`narrative\` field should be omitted.
- Check for opponent-induced game-over conditions.

**Other Rules:**
- All text outputs (narratives, events, etc.) must be in Chinese.
- Only provide an \`imagePrompt\` (in English) for rare, dramatic moments.`;

const parseGeminiResponse = (text: string): GeminiResponse => {
    try {
        const cleanedText = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return {
            narrative: parsed.narrative || "",
            opponentNarrative: parsed.opponentNarrative || "",
            event: parsed.event,
            gameStateUpdate: parsed.gameStateUpdate || { approval: 0, funding: 0, scandalRisk: 0 },
            opponentStateUpdate: parsed.opponentStateUpdate || { approval: 0, funding: 0 },
            opponentProfile: parsed.opponentProfile,
            imagePrompt: parsed.imagePrompt,
            isGameOver: parsed.isGameOver || false,
            gameOverReason: parsed.gameOverReason || ""
        };
    } catch (error) {
        console.error("Failed to parse Gemini response:", text, error);
        return {
            narrative: "故事生成器出现意外错误。请尝试做出另一个选择或重新开始游戏。",
            event: {
                title: "叙事错误",
                description: "与故事生成器的连接中断。我们无法继续当前事件。",
                choices: [{text: "重新开始游戏", outcomeHint: "这将结束当前会话。"}]
            },
            gameStateUpdate: { approval: 0, funding: 0, scandalRisk: 0 },
            opponentStateUpdate: { approval: 0, funding: 0 },
            opponentNarrative: "",
            imagePrompt: "An error screen with a sad computer icon",
            isGameOver: false,
            gameOverReason: ""
        };
    }
};

export const generateEventImage = async (prompt: string): Promise<string> => {
    if (!prompt) return '';
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        return '';
    } catch (error) {
        console.error("Image generation failed:", error);
        return '';
    }
};

export const startGame = async (profile: PlayerProfile): Promise<GeminiResponse> => {
    const talentsText = profile.talents.map(t => `- ${t.name}: ${t.description}`).join('\n');
    const prompt = `
        Start a new US Presidential Election Simulator game. Here is the player's character:
        - Name: ${profile.name}
        - Party: ${profile.party}
        - Slogan: "${profile.slogan}"
        - Stats: Appealing: ${profile.stats.appealing}, Policy Skill: ${profile.stats.policySkill}, Organization: ${profile.stats.organization}, Integrity: ${profile.stats.integrity}
        - Talents:\n${talentsText}

        Generate the opening narrative of their campaign launch and the first event they face. Introduce the main opponent. Give them a name, party, and a unique political style. The opponent's party should be the opposite of the player's.
        Initial game state: Player Approval: 50, Player Funding: 50, Player Scandal Risk: 10. Opponent Approval: 50, Opponent Funding: 50.
        The first narrative should be scene-setting, not the result of a choice.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        // FIX: The `contents` field was simplified to a string for a single-turn prompt, which is cleaner and less prone to SDK interpretation issues.
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.9,
        }
    });
    
    return parseGeminiResponse(response.text);
};

export const processTurn = async (
    profile: PlayerProfile, 
    history: string[], 
    currentStats: GameState,
    turn: 'player' | 'opponent',
    playerChoice?: GameEventChoice, // Only for player turn
): Promise<GeminiResponse> => {
    const talentsText = profile.talents.map(t => `- ${t.name}: ${t.description}`).join('\n');
    const historyText = history.slice(-5).join('\n...\n');

    let turnInstruction: string;
    if (turn === 'player') {
        if (!playerChoice) throw new Error("Player choice is required for player's turn.");
        const campaignActions: { [key: string]: string } = {
            '进行广告宣传': `Player chose to run an ad campaign. This costs significant funding and should moderately boost approval. Describe the ad's content and public reaction.`,
            '举办集会': `Player chose to hold a rally. This costs some funding, should give a small approval boost, but carries a risk of a gaffe (increasing scandal risk). Describe the rally.`,
            '进行筹款': `Player chose to focus on fundraising. This action consumes a turn but should significantly increase funding. Describe the fundraising event or effort.`,
        };
        const actionInstruction = campaignActions[playerChoice.text];
        const isTimePassing = playerChoice.text === "继续";

        if (actionInstruction) {
            turnInstruction = `**It is the Player's turn.** They are not responding to an event, but taking a campaign action: "${playerChoice.text}". ${actionInstruction} Generate the narrative outcome and corresponding state changes. This action should not trigger a new major 'event'.`;
        } else if (isTimePassing) {
            turnInstruction = `**It is the Player's turn.** They chose to let time pass. Generate a brief log of what happened over the next few days. Most of the time, this should NOT be a major, choice-driven event. Just provide narrative and small state updates. Occasionally, you can trigger a major choice-driven event by populating the 'event' field.`;
        } else {
            turnInstruction = `**It is the Player's turn.** They responded to the last event with the choice: "${playerChoice.text}". Based on their choice and profile, generate the narrative outcome, state changes, and potentially the next major event.`;
        }
    } else { // Opponent's turn
        turnInstruction = `**It is now the Opponent's turn.**
        - **Analyze:** Based on the current game state, what is the player's greatest weakness?
        - **Act:** What strategic action will opponent ${currentStats.opponentProfile?.name} take to exploit this weakness? (e.g., Run Ads, Hold Rally, Fundraise, or a special action).
        - **Narrate & Update:** Describe this action and its strategic reasoning in \`opponentNarrative\` and provide the resulting changes in \`opponentStateUpdate\`. Your action can also trigger a new \`event\` for the player.`;
    }

    const prompt = `
        **Recent History:**
        ${historyText}

        **Current State:**
        - Player Profile: ${profile.name} (${profile.party}), Appealing: ${profile.stats.appealing}, Policy Skill: ${profile.stats.policySkill}, Organization: ${profile.stats.organization}, Integrity: ${profile.stats.integrity}
        - Player Talents:\n${talentsText}
        - Player Stats: Approval: ${currentStats.approval}, Funding: ${currentStats.funding}, Scandal Risk: ${currentStats.scandalRisk}
        - Opponent: ${currentStats.opponentProfile?.name} (${currentStats.opponentProfile?.style})
        - Opponent Stats: Approval: ${currentStats.opponentApproval}, Funding: ${currentStats.opponentFunding}
        - Campaign Progress: ${currentStats.progress}% (0% is start, 100% is election day)

        **IMPORTANT RULE:** Remember the Zero-Sum Approval mechanic. Player Approval + Opponent Approval must always equal 100. A gain for one is an equal loss for the other.

        **Your Task:**
        ${turnInstruction}

        Check for game-over conditions. If a player's approval or funding is at or below 0, or scandal risk is 100 or above, the game should end.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        // FIX: The `contents` field was simplified to a string for a single-turn prompt, which is cleaner and less prone to SDK interpretation issues.
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.9,
        }
    });

    return parseGeminiResponse(response.text);
};