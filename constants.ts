
import { Talent, Language, Achievement, LocalProblem, GameEvent, StateAffiliation, Party, CharacterStats, TurnEffects, OpponentProfile, Difficulty } from './types';

export const UI_TEXT: { [lang in Language]: { [key: string]: string } } = {
    en: {
        title: 'ELECTION SIM',
        start: 'New Campaign',
        achievements: 'Achievements',
        poweredBy: 'Powered by Gemini',
        back: 'Back',
        characterTitle: 'Create Your Candidate',
        fullName: 'Full Name',
        party: 'Party',
        republican: 'Republican',
        democrat: 'Democrat',
        difficulty: 'Difficulty',
        easy: 'Easy',
        normal: 'Normal',
        hard: 'Hard',
        slogan: 'Campaign Slogan',
        biography: 'Biography',
        attributes: 'Attributes',
        points: 'Points Left',
        randomizeStats: 'Randomize Stats',
        randomizeAll: 'Randomize All',
        launch: 'Launch Campaign',
        selectTalents: 'Select Talents',
        pickTalents: 'talents to define your candidate.',
        confirm: 'Confirm',
        week: 'Week',
        of: 'of',
        polls: 'Polls',
        treasury: 'Treasury',
        influence: 'Influence',
        politicalCapital: 'Political Capital',
        scandal: 'Scandal',
        momentum: 'Momentum',
        debateNight: 'Debate Night',
        yourHand: 'Your Hand',
        initializing: 'Initializing Simulation...',
        victory: 'Victory!',
        defeat: 'Defeat.',
        restart: 'Restart Campaign',
        achievementsTitle: 'Hall of Achievements',
        achievementsDesc: 'Unique moments and spectacular failures from your political career.',
        locked: 'Locked. The story of how this is unlocked has not yet been written.',
        mapPlayer: 'Player',
        mapOpponent: 'Opponent',
        mapSwing: 'Swing',
        returnToMap: 'Return to Map',
        stateFocusTitle: 'State Focus: {stateName}',
        stateFocusDesc: 'Assign a special team to gain a strategic advantage in this state.',
        cost: 'Cost',
        duration: 'Duration',
        turns: 'Turns',
        effect: 'Effect',
        nationalAgendaTitle: 'National Agenda',
        stateDispatchTitle: 'State Dispatch: {stateName}',
        turnSummaryTitle: 'Campaign Update',
        continue: 'Continue',
        statesFlipped: 'Electoral Map Update',
        yourCampaign: 'Your Campaign',
        opponentCampaign: "Opponent's Campaign",
        signaturePolicies: 'Signature Policies',
        enactPolicy: 'Enact Policy',
        namePlaceholder: 'Name',
        sloganPlaceholder: '...',
        bioPlaceholder: "Your candidate's story...",
        statCheck: 'CHECK',
        roll: 'Roll',
        bonus: 'Bonus',
        total: 'Total',
        generatingNews: 'Generating news...',
        opponentMove: 'Opponent is making their move...',
        clickMapToIntervene: 'Select state on map to intervene.',
        breakingScandal: 'BREAKING SCANDAL',
    },
    zh: {
        title: '选举模拟',
        start: '新的竞选',
        achievements: '成就',
        poweredBy: '由 Gemini 驱动',
        back: '返回',
        characterTitle: '创建您的候选人',
        fullName: '全名',
        party: '党派',
        republican: '共和党',
        democrat: '民主党',
        difficulty: '难度',
        easy: '简单',
        normal: '普通',
        hard: '困难',
        slogan: '竞选口号',
        biography: '个人简介',
        attributes: '属性',
        points: '剩余点数',
        randomizeStats: '随机化属性',
        randomizeAll: '随机化所有',
        launch: '发起竞选',
        selectTalents: '选择天赋',
        pickTalents: '个天赋来定义您的候选人。',
        confirm: '确认',
        week: '第',
        of: '周 / 共 20 周',
        polls: '民调',
        treasury: '资金',
        influence: '影响力',
        politicalCapital: '政治资本',
        scandal: '丑闻',
        momentum: '势头',
        debateNight: '辩论之夜',
        yourHand: '你的手牌',
        initializing: '正在初始化模拟...',
        victory: '胜利！',
        defeat: '失败。',
        restart: '重新开始竞选',
        achievementsTitle: '成就殿堂',
        achievementsDesc: '您政治生涯中的独特时刻和惊人失败。',
        locked: '未解锁。如何解锁此成就的故事尚未书写。',
        mapPlayer: '玩家',
        mapOpponent: '对手',
        mapSwing: '摇摆',
        returnToMap: '返回地图',
        stateFocusTitle: '州焦点: {stateName}',
        stateFocusDesc: '指派一个特别团队，在该州获得战略优势。',
        cost: '成本',
        duration: '持续时间',
        turns: '回合',
        effect: '效果',
        nationalAgendaTitle: '全国议程',
        stateDispatchTitle: '州快讯: {stateName}',
        turnSummaryTitle: '竞选更新',
        continue: '继续',
        statesFlipped: '选举地图更新',
        yourCampaign: '你的竞选',
        opponentCampaign: '对手的竞选',
        signaturePolicies: '标志性政策',
        enactPolicy: '颁布政策',
        namePlaceholder: '姓名',
        sloganPlaceholder: '...',
        bioPlaceholder: '您的候选人故事...',
        statCheck: '检定',
        roll: '掷骰',
        bonus: '加成',
        total: '总计',
        generatingNews: '正在生成新闻...',
        opponentMove: '对手正在行动...',
        clickMapToIntervene: '在地图上选择该州以进行干预。',
        breakingScandal: '突发丑闻',
    }
};

export const TOTAL_STAT_POINTS = 20;
export const MIN_STAT_POINTS = 1;
export const MAX_STAT_POINTS = 10;
export const TALENTS_TO_SHOW = 10;
export const TALENTS_TO_PICK = 3;
export const CAMPAIGN_WEEKS = 20;

export const RANDOM_CANDIDATE_PROFILES = [
    {
        name: "Elon Musk",
        slogan: { en: "Occupy Mars. Save Earth.", zh: "占领火星，拯救地球。" },
        biography: { en: "The richest man in the world, aiming to run the country like one of his companies: fast, disruptive, and occasionally chaotic.", zh: "世界首富，旨在像管理他的公司一样管理国家：快速、颠覆性，偶尔混乱。" }
    },
    {
        name: "Joe Biden",
        slogan: { en: "Finish the Job.", zh: "完成未竟的事业。" },
        biography: { en: "A veteran politician seeking to cement his legacy, emphasizing stability, experience, and the soul of the nation.", zh: "一位寻求巩固其政治遗产的资深政治家，强调稳定、经验和国家的灵魂。" }
    },
    {
        name: "Bernie Sanders",
        slogan: { en: "Not Me. Us.", zh: "不是我，是我们。" },
        biography: { en: "The champion of the progressive movement, demanding a political revolution to take on the billionaire class.", zh: "进步运动的捍卫者，要求进行一场政治革命来对抗亿万富翁阶层。" }
    },
    {
        name: "Ron DeSantis",
        slogan: { en: "Make America Florida.", zh: "让美国成为佛罗里达。" },
        biography: { en: "A cultural warrior fighting against 'woke' ideology, promising disciplined conservative governance.", zh: "一位反对“觉醒”意识形态的文化战士，承诺实行纪律严明的保守治理。" }
    },
    {
        name: "Kamala Harris",
        slogan: { en: "For The People.", zh: "为了人民。" },
        biography: { en: "Former prosecutor and VP, running on a platform of justice, equality, and breaking glass ceilings.", zh: "前检察官和副总统，以正义、平等和打破玻璃天花板为竞选纲领。" }
    },
    {
        name: "Dwayne 'The Rock' Johnson",
        slogan: { en: "The People's Champ.", zh: "人民的冠军。" },
        biography: { en: "A global superstar crossing party lines with charisma and muscle, promising to unite a divided nation.", zh: "一位跨越党派界限的全球超级巨星，凭借魅力和肌肉承诺团结一个分裂的国家。" }
    }
];

export const STAT_DISPLAY_NAMES: { [key in keyof CharacterStats]: { en: string; zh: string } } = {
    appealing: { en: "CHARISMA", zh: "个人魅力" },
    policySkill: { en: "POLICY", zh: "政策能力" },
    organization: { en: "ORGANIZATION", zh: "组织能力" },
    integrity: { en: "INTEGRITY", zh: "诚信正直" }
};

export const DIFFICULTY_MODIFIERS = {
    [Difficulty.Easy]: {
        initialTreasury: 75,
        initialInfluence: 20,
        initialPoliticalCapital: 15,
        aiAggressiveness: 0.7,
        fundraisingModifier: 1.25,
    },
    [Difficulty.Normal]: {
        initialTreasury: 50,
        initialInfluence: 10,
        initialPoliticalCapital: 10,
        aiAggressiveness: 1.0,
        fundraisingModifier: 1.0,
    },
    [Difficulty.Hard]: {
        initialTreasury: 30,
        initialInfluence: 5,
        initialPoliticalCapital: 5,
        aiAggressiveness: 1.3,
        fundraisingModifier: 0.8,
    }
};

// Rule-Based Logic: Real Electoral Votes (Total 538, 270 to win)
export const ELECTORAL_VOTES: { [key: string]: number } = {
    "AL": 9, "AK": 3, "AZ": 11, "AR": 6, "CA": 54, "CO": 10, "CT": 7, "DE": 3, "DC": 3,
    "FL": 30, "GA": 16, "HI": 4, "ID": 4, "IL": 19, "IN": 11, "IA": 6, "KS": 6, "KY": 8,
    "LA": 8, "ME": 4, "MD": 10, "MA": 11, "MI": 15, "MN": 10, "MS": 6, "MO": 10, "MT": 4,
    "NE": 5, "NV": 6, "NH": 4, "NJ": 14, "NM": 5, "NY": 28, "NC": 16, "ND": 3, "OH": 17,
    "OK": 7, "OR": 8, "PA": 19, "RI": 4, "SC": 9, "SD": 3, "TN": 11, "TX": 40, "UT": 6,
    "VT": 3, "VA": 13, "WA": 12, "WV": 4, "WI": 10, "WY": 3
};

// Map Initialization Defaults
export const SAFE_DEM_STATES = ["CA", "NY", "IL", "MA", "MD", "WA", "OR", "NJ", "CT", "RI", "DE", "HI", "VT", "DC", "NM", "CO", "VA", "MN", "ME", "NH"];
export const SAFE_REP_STATES = ["TX", "TN", "IN", "MO", "AL", "SC", "KY", "LA", "OK", "AR", "KS", "MS", "UT", "WV", "ID", "NE", "SD", "ND", "MT", "WY", "AK", "IA"];
export const SWING_STATES = ["PA", "MI", "WI", "AZ", "GA", "NC", "NV", "FL", "OH"];

export const STATE_NAME_TO_ABBR: { [key: string]: string } = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "District of Columbia": "DC",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL",
    "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA",
    "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN",
    "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR",
    "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD",
    "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA",
    "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
};

export const STATE_ABBR_TO_NAME: { [key: string]: string } = Object.fromEntries(
    Object.entries(STATE_NAME_TO_ABBR).map(([name, abbr]) => [abbr, name])
);

export const STATE_NAMES: { [key: string]: { en: string; zh: string } } = {
    "Alabama": { en: "Alabama", zh: "阿拉巴马州" }, "Alaska": { en: "Alaska", zh: "阿拉斯加州" }, "Arizona": { en: "Arizona", zh: "亚利桑那州" }, "Arkansas": { en: "Arkansas", zh: "阿肯色州" }, "California": { en: "California", zh: "加利福尼亚州" },
    "Colorado": { en: "Colorado", zh: "科罗拉多州" }, "Connecticut": { en: "Connecticut", zh: "康涅狄格州" }, "Delaware": { en: "Delaware", zh: "特拉华州" }, "District of Columbia": { en: "District of Columbia", zh: "哥伦比亚特区" },
    "Florida": { en: "Florida", zh: "佛罗里达州" }, "Georgia": { en: "Georgia", zh: "佐治亚州" }, "Hawaii": { en: "Hawaii", zh: "夏威夷州" }, "Idaho": { en: "Idaho", zh: "爱达荷州" }, "Illinois": { en: "Illinois", zh: "伊利诺伊州" },
    "Indiana": { en: "Indiana", zh: "印第安纳州" }, "Iowa": { en: "Iowa", zh: "爱荷华州" }, "Kansas": { en: "Kansas", zh: "堪萨斯州" }, "Kentucky": { en: "Kentucky", zh: "肯塔基州" }, "Louisiana": { en: "Louisiana", zh: "路易斯安那州" },
    "Maine": { en: "Maine", zh: "缅因州" }, "Maryland": { en: "Maryland", zh: "马里兰州" }, "Massachusetts": { en: "Massachusetts", zh: "马萨诸塞州" }, "Michigan": { en: "Michigan", zh: "密歇根州" }, "Minnesota": { en: "Minnesota", zh: "明尼苏达州" },
    "Mississippi": { en: "Mississippi", zh: "密西西比州" }, "Missouri": { en: "Missouri", zh: "密苏里州" }, "Montana": { en: "Montana", zh: "蒙大拿州" }, "Nebraska": { en: "Nebraska", zh: "内布拉斯加州" }, "Nevada": { en: "Nevada", zh: "内华达州" },
    "New Hampshire": { en: "New Hampshire", zh: "新罕布什尔州" }, "New Jersey": { en: "New Jersey", zh: "新泽西州" }, "New Mexico": { en: "New Mexico", zh: "新墨西哥州" }, "New York": { en: "New York", zh: "纽约州" },
    "North Carolina": { en: "North Carolina", zh: "北卡罗来纳州" }, "North Dakota": { en: "North Dakota", zh: "北达科他州" }, "Ohio": { en: "Ohio", zh: "俄亥俄州" }, "Oklahoma": { en: "Oklahoma", zh: "俄克拉荷马州" }, "Oregon": { en: "Oregon", zh: "俄勒冈州" },
    "Pennsylvania": { en: "Pennsylvania", zh: "宾夕法尼亚州" }, "Rhode Island": { en: "Rhode Island", zh: "罗德岛州" }, "South Carolina": { en: "South Carolina", zh: "南卡罗来纳州" }, "South Dakota": { en: "South Dakota", zh: "南达科他州" },
    "Tennessee": { en: "Tennessee", zh: "田纳西州" }, "Texas": { en: "Texas", zh: "德克萨斯州" }, "Utah": { en: "Utah", zh: "犹他州" }, "Vermont": { en: "Vermont", zh: "佛蒙特州" }, "Virginia": { en: "Virginia", zh: "弗吉尼亚州" },
    "Washington": { en: "Washington", zh: "华盛顿州" }, "West Virginia": { en: "West Virginia", zh: "西弗吉尼亚州" }, "Wisconsin": { en: "Wisconsin", zh: "威斯康星州" }, "Wyoming": { en: "Wyoming", zh: "怀俄明州" }
};

export const ALL_TALENTS: Talent[] = [
    { id: 'bulletproof_ear', name: { en: "Bulletproof Ear", zh: "防弹耳朵" }, description: { en: "You turned your head at the perfect millisecond. Divine intervention? +2 Integrity, +1 Charisma.", zh: "你在完美的毫秒转过头去。天意？+2 诚信，+1 魅力。" } },
    { id: 'dark_laser_eyes', name: { en: "Dark Laser Eyes", zh: "黑暗激光眼" }, description: { en: "No more malarkey. Your rhetoric burns through the opposition. +2 Policy, +1 Organization.", zh: "不再废话。你的言辞能穿透反对派。+2 政策，+1 组织。" } },
    { id: 'mars_technoking', name: { en: "Mars Technoking", zh: "火星科技王" }, description: { en: "You have rockets, tunnels, and a social network. Chaos is a ladder. +2 Organization, +1 Charisma.", zh: "你有火箭、隧道和社交网络。混乱是阶梯。+2 组织，+1 魅力。" } },
    { id: 'mitten_icon', name: { en: "Mitten Icon", zh: "手套偶像" }, description: { en: "You sit in a folding chair with giant mittens. The internet loves your authenticity. +2 Integrity, +1 Charisma.", zh: "你戴着巨大的手套坐在折叠椅上。互联网爱你的真实。+2 诚信，+1 魅力。" } },
    { id: 'coconut_context', name: { en: "Coconut Context", zh: "椰子树背景" }, description: { en: "You didn't just fall out of a coconut tree. You exist in the context. +2 Charisma, +1 Policy.", zh: "你不是刚从椰子树上掉下来的。你存在于背景中。+2 魅力，+1 政策。" } },
    { id: 'wall_builder', name: { en: "Wall Builder", zh: "筑墙大师" }, description: { en: "You love big, beautiful structures. And you make others pay for them. +2 Organization, +1 Integrity.", zh: "你喜欢宏伟、美丽的建筑。而且你让别人买单。+2 组织，+1 诚信。" } },
    { id: 'email_deleter', name: { en: "Server Wiper", zh: "服务器擦除者" }, description: { en: "What emails? You handle digital crises with a cloth. +3 Organization.", zh: "什么邮件？你用抹布处理数字危机。+3 组织。" } },
    { id: 'couch_critic', name: { en: "Couch Critic", zh: "沙发评论家" }, description: { en: "You have strong opinions on living room furniture. It's weirdly compelling. +1 Charisma, +1 Policy.", zh: "你对客厅家具有独到的见解。这奇怪地引人注目。+1 魅力，+1 政策。" } },
    { id: 'brain_worm', name: { en: "Brain Worm Survivor", zh: "脑虫幸存者" }, description: { en: "A worm ate part of your brain. Now you are fearless and unpredictable. +3 Integrity.", zh: "一条虫子吃了你的一部分大脑。现在你无所畏惧且不可预测。+3 诚信。" } },
    { id: 'covfefe_linguist', name: { en: "Covfefe Linguist", zh: "Covfefe 语言学家" }, description: { en: "Despite the constant negative press covfefe. +3 Charisma.", zh: "尽管一直有负面新闻 covfefe。+3 魅力。" } },
    { id: 'tan_suit', name: { en: "Tan Suit Wearer", zh: "浅色西装穿着者" }, description: { en: "You wore a beige suit. It was the biggest scandal of the year. Simpler times. +2 Integrity, +1 Policy.", zh: "你穿了米色西装。这是年度最大的丑闻。单纯的时代。+2 诚信，+1 政策。" } },
    { id: 'fly_lord', name: { en: "Lord of the Flies", zh: "苍蝇王" }, description: { en: "Flies land on your face during debates. You don't even blink. +2 Policy, +1 Integrity.", zh: "辩论时苍蝇停在你脸上。你甚至不眨眼。+2 政策，+1 诚信。" } },
    { id: 'ice_cream_connoisseur', name: { en: "Ice Cream Connoisseur", zh: "冰淇淋行家" }, description: { en: "Listen jack, chocolate chip is the deal. +2 Charisma, +1 Integrity.", zh: "听着伙计，巧克力片才是王道。+2 魅力，+1 诚信。" } },
    { id: 'boot_wearer', name: { en: "Lifted Boot Wearer", zh: "增高靴穿着者" }, description: { en: "Your fingers are long, and your boots have... style. +2 Organization, +1 Charisma.", zh: "你的手指很长，你的靴子很有……风格。+2 组织，+1 魅力。" } },
    { id: 'dog_eater_rumor', name: { en: "Pet Protector", zh: "宠物守护者" }, description: { en: "They're eating the dogs! You shout wild warnings to the suburbs. +2 Charisma, +1 Policy.", zh: "他们在吃狗！你向郊区发出疯狂的警告。+2 魅力，+1 政策。" } },
    { id: 'resume_creative', name: { en: "Resume Embellisher", zh: "简历美化师" }, description: { en: "You were a volleyball star at a college you didn't attend. People love a good story. +3 Charisma, -1 Integrity.", zh: "你在没上过的大学里是排球明星。人们喜欢好故事。+3 魅力，-1 诚信。" } },
    { id: 'bushes_hider', name: { en: "Bushes Hider", zh: "灌木丛隐蔽者" }, description: { en: "You can conduct press briefings from within the foliage. +2 Organization, +1 Policy.", zh: "你可以在树叶中进行新闻发布会。+2 组织，+1 政策。" } },
    { id: 'zodiac_suspect', name: { en: "Zodiac Suspect", zh: "十二宫嫌疑人" }, description: { en: "Rumors swirl that you might be a serial killer. Your opponents are terrified. +2 Policy, +1 Organization.", zh: "有传言说你可能是连环杀手。你的对手吓坏了。+2 政策，+1 组织。" } },
    { id: 'cognitive_ace', name: { en: "Cognitive Ace", zh: "认知天才" }, description: { en: "Person. Woman. Man. Camera. TV. You listed them in order. Genius. +2 Charisma, +1 Policy.", zh: "人。女人。男人。相机。电视。你按顺序背出来了。天才。+2 魅力，+1 政策。" } },
    { id: 'corn_pop_victor', name: { en: "Corn Pop Victor", zh: "玉米花战胜者" }, description: { en: "You faced down a bad dude named Corn Pop with a rusty chain. +2 Integrity, +1 Charisma.", zh: "你用生锈的链子面对了一个叫玉米花的坏家伙。+2 诚信，+1 魅力。" } }
];

export const TALENT_EFFECTS: { [talentName: string]: Partial<CharacterStats> } = {
    // English Keys
    "Bulletproof Ear": { integrity: 2, appealing: 1 },
    "Dark Laser Eyes": { policySkill: 2, organization: 1 },
    "Mars Technoking": { organization: 2, appealing: 1 },
    "Mitten Icon": { integrity: 2, appealing: 1 },
    "Coconut Context": { appealing: 2, policySkill: 1 },
    "Wall Builder": { organization: 2, integrity: 1 },
    "Server Wiper": { organization: 3 },
    "Couch Critic": { appealing: 1, policySkill: 1 },
    "Brain Worm Survivor": { integrity: 3 },
    "Covfefe Linguist": { appealing: 3 },
    "Tan Suit Wearer": { integrity: 2, policySkill: 1 },
    "Lord of the Flies": { policySkill: 2, integrity: 1 },
    "Ice Cream Connoisseur": { appealing: 2, integrity: 1 },
    "Lifted Boot Wearer": { organization: 2, appealing: 1 },
    "Pet Protector": { appealing: 2, policySkill: 1 },
    "Resume Embellisher": { appealing: 3, integrity: -1 },
    "Bushes Hider": { organization: 2, policySkill: 1 },
    "Zodiac Suspect": { policySkill: 2, organization: 1 },
    "Cognitive Ace": { appealing: 2, policySkill: 1 },
    "Corn Pop Victor": { integrity: 2, appealing: 1 },

    // Chinese Keys
    "防弹耳朵": { integrity: 2, appealing: 1 },
    "黑暗激光眼": { policySkill: 2, organization: 1 },
    "火星科技王": { organization: 2, appealing: 1 },
    "手套偶像": { integrity: 2, appealing: 1 },
    "椰子树背景": { appealing: 2, policySkill: 1 },
    "筑墙大师": { organization: 2, integrity: 1 },
    "服务器擦除者": { organization: 3 },
    "沙发评论家": { appealing: 1, policySkill: 1 },
    "脑虫幸存者": { integrity: 3 },
    "Covfefe 语言学家": { appealing: 3 },
    "浅色西装穿着者": { integrity: 2, policySkill: 1 },
    "苍蝇王": { policySkill: 2, integrity: 1 },
    "冰淇淋行家": { appealing: 2, integrity: 1 },
    "增高靴穿着者": { organization: 2, appealing: 1 },
    "宠物守护者": { appealing: 2, policySkill: 1 },
    "简历美化师": { appealing: 3, integrity: -1 },
    "灌木丛隐蔽者": { organization: 2, policySkill: 1 },
    "十二宫嫌疑人": { policySkill: 2, organization: 1 },
    "认知天才": { appealing: 2, policySkill: 1 },
    "玉米花战胜者": { integrity: 2, appealing: 1 }
};

export const MEDIA_BIASES: { [source: string]: Party } = {
    // Republican Leaning
    "FOX News Opinion": Party.Republican,
    "The Daily Wire": Party.Republican,
    "Breitbart": Party.Republican,
    "NY Post Editorial": Party.Republican,

    // Democrat Leaning
    "MSNBC Opinion": Party.Democrat,
    "The New York Times Editorial": Party.Democrat,
    "CNN Commentary": Party.Democrat,
    "HuffPost": Party.Democrat,
};

export const STATE_FOCUS_OPTIONS = [
    { id: 'rallies', name: { en: "Organize Rallies", zh: "组织集会" }, description: { en: "Whip up local support, increasing your chances of winning over this state each turn.", zh: "激发当地支持，增加您每回合赢得该州的机会。" }, cost: { influence: 10 }, duration: 4, effect: { pollsChange: 3 }, effectDescription: { en: "+3% chance/turn to win state", zh: "+3% 几率/回合 赢得州" } },
    { id: 'fundraiser', name: { en: "Host Fundraiser", zh: "举办筹款活动" }, description: { en: "Tap into local donor networks to boost your campaign treasury over several turns.", zh: "利用当地捐助者网络，在几回合内充实您的竞选资金。" }, cost: { influence: 5 }, duration: 3, effect: { treasuryChange: 5 }, effectDescription: { en: "+$5M Treasury/turn", zh: "+5M 资金/回合" } },
    { id: 'smear', name: { en: "Launch Smear Campaign", zh: "发起抹黑运动" }, description: { en: "Dig up dirt on your opponent's local operations, increasing their scandal rating.", zh: "挖掘对手在当地的黑料，增加他们的丑闻指数。" }, cost: { influence: 8, treasury: 10 }, duration: 2, effect: { opponentScandalChange: 4 }, effectDescription: { en: "+4% Opponent Scandal/turn", zh: "+4% 对手丑闻/回合" } }
];

export const STATE_SPECIFIC_DECISIONS: (GameEvent & { stateAbbr: string })[] = [
    { id: 'pa_steel_tariffs', stateAbbr: 'PA', title: { en: 'Steel Tariff Debate', zh: '钢铁关税辩论' }, description: { en: 'The steelworkers union in Pennsylvania is demanding tariffs on foreign steel to protect local jobs, but economists warn it could trigger a trade war.', zh: '宾夕法尼亚州的钢铁工人工会要求对外国钢铁征收关税以保护当地就业，但经济学家警告这可能引发贸易战。' }, choices: [ { text: { en: 'Impose the tariffs. Protect our workers!', zh: '征收关税。保护我们的工人！' }, outcomeHint: { en: 'Gain local union support, but risk national economic backlash.', zh: '获得当地工会支持，但冒着国家经济反弹的风险。' }, influenceCost: 5, baseEffects: { electoralMapUpdates: [{ state: 'PA', affiliation: StateAffiliation.Player }], momentumChange: 5, opponentPollsChange: -2, politicalCapitalChange: 2 }, }, { text: { en: 'Side with free trade. Tariffs hurt everyone.', zh: '支持自由贸易。关税伤害所有人。' }, outcomeHint: { en: 'Appease national business interests, but anger the local working class.', zh: '安抚国家商业利益，但激怒当地工人阶级。' }, baseEffects: { treasuryChange: 15, electoralMapUpdates: [{ state: 'PA', affiliation: StateAffiliation.Opponent }], momentumChange: -5 }, } ] },
    { id: 'fl_everglades_funding', stateAbbr: 'FL', title: { en: 'Everglades Restoration Funding', zh: '大沼泽地恢复资金' }, description: { en: 'Environmental groups are pushing for a massive, expensive bill to fund Everglades restoration in Florida. It\'s popular with young voters and conservationists but opposed by developers.', zh: '环保组织正在推动一项巨额且昂贵的法案，为佛罗里达州的大沼泽地恢复提供资金。这受到年轻选民和自然保护主义者的欢迎，但遭到开发商的反对。' }, choices: [ { text: { en: 'Sign the bill. The environment is paramount.', zh: '签署法案。环境至上。' }, outcomeHint: { en: 'Gain support from environmentalists, but it will cost a fortune.', zh: '获得环保人士的支持，但这将花费巨资。' }, cost: 15, baseEffects: { electoralMapUpdates: [{ state: 'FL', affiliation: StateAffiliation.Player }], mediaAttentionChange: 5, politicalCapitalChange: 3 }, }, { text: { en: 'Veto the bill. We need development.', zh: '否决法案。我们需要发展。' }, outcomeHint: { en: 'Powerful developers will fill your campaign coffers.', zh: '强大的开发商将充实您的竞选资金。' }, baseEffects: { treasuryChange: 25, electoralMapUpdates: [{ state: 'FL', affiliation: StateAffiliation.Opponent }], scandalChange: 2 }, } ] },
    { id: 'az_water_rights', stateAbbr: 'AZ', title: { en: 'Colorado River Water Rights', zh: '科罗拉多河水权' }, description: { en: 'A water rights dispute between Arizona farmers and a neighboring state is escalating. You are being pressured to intervene.', zh: '亚利桑那州农民与邻国之间的水权纠纷正在升级。您正面临干预的压力。' }, choices: [ { text: { en: 'Intervene on behalf of Arizona farmers.', zh: '代表亚利桑那州农民进行干预。' }, outcomeHint: { en: 'This will be a huge win in Arizona, but may hurt you in Nevada.', zh: '这在亚利桑那州将是一个巨大的胜利，但可能会在内华达州伤害你。' }, baseEffects: { electoralMapUpdates: [ { state: 'AZ', affiliation: StateAffiliation.Player }, { state: 'NV', affiliation: StateAffiliation.Opponent } ], momentumChange: 3, politicalCapitalChange: 1 }, }, { text: { en: 'Stay neutral and call for federal mediation.', zh: '保持中立并呼吁联邦调解。' }, outcomeHint: { en: 'A safe, but uninspiring choice that pleases no one.', zh: '一个安全但不令人鼓舞的选择，谁也不讨好。' }, baseEffects: { influenceChange: -5, pollsChange: -1 }, } ] },
    { id: 'mi_auto_bailout', stateAbbr: 'MI', title: { en: 'Auto Industry Subsidies', zh: '汽车工业补贴' }, description: { en: 'A major auto manufacturer in Michigan is on the brink of collapse and is asking for government subsidies to retool their factories for EVs.', zh: '密歇根州的一家主要汽车制造商濒临倒闭，要求政府补贴以重组工厂生产电动汽车。' }, choices: [ { text: { en: 'Approve the subsidies. We can\'t lose those jobs.', zh: '批准补贴。我们不能失去这些工作。' }, outcomeHint: { en: 'A major cash injection is required, but it will secure Michigan\'s loyalty.', zh: '需要大量注资，但这将确保密歇根州的忠诚。' }, cost: 20, baseEffects: { electoralMapUpdates: [{ state: 'MI', affiliation: StateAffiliation.Player }], mediaAttentionChange: 5, politicalCapitalChange: 2 }, }, { text: { en: 'Let the market decide. No more bailouts.', zh: '让市场决定。不再救助。' }, outcomeHint: { en: 'Fiscally conservative, but you risk being blamed for massive job losses.', zh: '财政保守，但你可能会因为大规模失业而受到指责。' }, baseEffects: { electoralMapUpdates: [{ state: 'MI', affiliation: StateAffiliation.Opponent }], pollsChange: -3, scandalChange: 3 }, } ] }
];

export const MASTER_EVENT_LIST: GameEvent[] = [
    { id: 'national_tax_cut', title: { en: 'Propose Major Tax Cuts', zh: '提议大幅减税' }, description: { en: 'A sweeping tax cut bill is on the table. It\'s popular with corporations and the wealthy, but critics say it will explode the national debt and hurt social programs.', zh: '一项全面的减税法案已摆上桌面。它受到企业和富人的欢迎，但批评人士称这将导致国债激增并损害社会项目。' }, choices: [ { text: { en: 'Push the tax cuts through. Unleash the economy!', zh: '推动减税。释放经济活力！' }, outcomeHint: { en: 'Boosts your treasury through corporate donations, but increases national scandal.', zh: '通过企业捐款增加您的资金，但会增加国家丑闻。' }, baseEffects: { treasuryChange: 50, scandalChange: 10, opponentPollsChange: -3, politicalCapitalChange: -5 }, }, { text: { en: 'Veto the bill. Protect the social safety net.', zh: '否决法案。保护社会安全网。' }, outcomeHint: { en: 'Gain popular support but lose major funding opportunities.', zh: '获得民众支持，但失去主要的融资机会。' }, baseEffects: { pollsChange: 5, treasuryChange: -30, momentumChange: 5, politicalCapitalChange: 5 }, } ] },
    { id: 'infrastructure_bill', title: { en: 'Massive Infrastructure Bill', zh: '大规模基础设施法案' }, description: { en: 'A once-in-a-generation infrastructure bill to rebuild roads, bridges, and the power grid is proposed. It will create jobs but requires an enormous investment.', zh: '提议了一项千载难逢的基础设施法案，以重建道路、桥梁和电网。它将创造就业机会，但需要巨额投资。' }, choices: [ { text: { en: 'Sign the bill. A historic investment.', zh: '签署法案。一项历史性投资。' }, outcomeHint: { en: 'A huge expense, but will provide a massive boost to polls and momentum across the country.', zh: '一笔巨大的开支，但将极大地提振全国的民调和势头。' }, cost: 75, influenceCost: 10, baseEffects: { pollsChange: 10, momentumChange: 15, mediaAttentionChange: 10, politicalCapitalChange: 10 }, }, { text: { en: 'Block the bill. It\'s fiscally irresponsible.', zh: '阻止法案。这在财政上是不负责任的。' }, outcomeHint: { en: 'Save money, but be seen as an obstructionist.', zh: '省钱，但被视为阻挠者。' }, baseEffects: { opponentPollsChange: 5, momentumChange: -10, scandalChange: 3, politicalCapitalChange: -8 }, } ] },
    { id: 'supreme_court_nomination', title: { en: 'Supreme Court Nomination', zh: '最高法院提名' }, description: { en: 'A Supreme Court justice has retired, giving you a critical nomination. The choice will energize your base but infuriate the opposition.', zh: '一位最高法院大法官退休了，为您提供了一个关键的提名机会。这个选择将激励您的基础选民，但会激怒反对派。' }, choices: [ { text: { en: 'Nominate a hardline ideological judge.', zh: '提名一位强硬的意识形态法官。' }, outcomeHint: { en: 'Your base will be thrilled, solidifying support in safe states, but swing states may suffer.', zh: '您的基础选民会很兴奋，巩固在安全州的支持，但摇摆州可能会受损。' }, influenceCost: 20, baseEffects: { momentumChange: 10, opponentPollsChange: 5, pollsChange: -2, politicalCapitalChange: 8 }, }, { text: { en: 'Nominate a moderate, consensus candidate.', zh: '提名一位温和的共识候选人。' }, outcomeHint: { en: 'A safe choice that avoids a major fight but inspires no one.', zh: '一个避免重大争斗但无法激励任何人的安全选择。' }, influenceCost: 5, baseEffects: { scandalChange: -5, momentumChange: -5, politicalCapitalChange: -3 }, } ] },
    // NEW EVENTS
    {
        id: 'foreign_policy_crisis',
        title: { en: 'Foreign Policy Crisis', zh: '外交政策危机' },
        description: { en: 'A key ally has been invaded. The world looks to America for leadership.', zh: '一个关键盟友遭到入侵。世界期待美国的领导。' },
        choices: [
            { text: { en: 'Deploy troops to support the ally.', zh: '部署军队支持盟友。' }, outcomeHint: { en: 'Strong leadership, but risks war and budget drain.', zh: '强有力的领导，但有战争和预算流失的风险。' }, cost: 40, baseEffects: { pollsChange: 8, treasuryChange: -20, politicalCapitalChange: 5 } },
            { text: { en: 'Issue sanctions and stay out.', zh: '实施制裁并置身事外。' }, outcomeHint: { en: 'Safe, but looks weak on the global stage.', zh: '安全，但在国际舞台上显得软弱。' }, baseEffects: { pollsChange: -3, opponentPollsChange: 3 } }
        ]
    },
    {
        id: 'tech_monopoly',
        title: { en: 'Tech Monopoly Antitrust', zh: '科技垄断反垄断' },
        description: { en: 'Congress is pushing a bill to break up big tech companies.', zh: '国会正在推动一项拆分大型科技公司的法案。' },
        choices: [
            { text: { en: 'Support the breakup.', zh: '支持拆分。' }, outcomeHint: { en: 'Popular with the public, hated by donors.', zh: '受公众欢迎，被捐助者憎恨。' }, baseEffects: { pollsChange: 5, treasuryChange: -30, momentumChange: 2 } },
            { text: { en: 'Defend innovation (and donors).', zh: '捍卫创新（和捐助者）。' }, outcomeHint: { en: 'Secure funding, but face populist backlash.', zh: '获得资金，但面临民粹主义的强烈抵制。' }, baseEffects: { treasuryChange: 40, pollsChange: -4, scandalChange: 2 } }
        ]
    },
    {
        id: 'viral_gaffe',
        title: { en: 'Hot Mic Moment', zh: '麦克风未关时刻' },
        description: { en: 'You were caught on a hot mic making a rude comment about a local sports team.', zh: '你被麦克风捕捉到对当地运动队发表了粗鲁的评论。' },
        choices: [
            { text: { en: 'Apologize profusely.', zh: '诚恳道歉。' }, outcomeHint: { en: 'Damage control.', zh: '损害控制。' }, baseEffects: { politicalCapitalChange: -3, momentumChange: -2 } },
            { text: { en: 'Double down. They stink!', zh: '加倍下注。他们太烂了！' }, outcomeHint: { en: 'Risky, but might show "authenticity".', zh: '冒险，但可能显示出“真实性”。' }, baseEffects: { scandalChange: 5, mediaAttentionChange: 10 } } // High risk high reward potential handled by GM narrative
        ]
    }
];

export const SCANDAL_EVENTS: GameEvent[] = [
    {
        id: 'embezzlement_rumors',
        title: { en: 'Campaign Finance Probe', zh: '竞选财务调查' },
        description: { en: 'Rumors are swirling about missing campaign funds. An investigation is looming.', zh: '关于竞选资金失踪的谣言四起。调查迫在眉睫。' },
        isCritical: true,
        choices: [
            { text: { en: 'Cooperate fully.', zh: '全力配合。' }, outcomeHint: { en: 'Clears name eventually, but slows momentum.', zh: '最终洗清罪名，但减缓势头。' }, baseEffects: { momentumChange: -10, scandalChange: -5 } },
            { text: { en: 'Call it a Witch Hunt!', zh: '称之为政治迫害！' }, outcomeHint: { en: 'Energizes base, but alienates moderates.', zh: '激励基础选民，但疏远温和派。' }, baseEffects: { pollsChange: -2, opponentPollsChange: -2, mediaAttentionChange: 15, scandalChange: 5 } }
        ]
    },
    {
        id: 'leaked_audio',
        title: { en: 'Leaked Private Audio', zh: '私人音频泄露' },
        description: { en: 'Audio of you mocking your own voters has leaked.', zh: '你嘲笑自己选民的音频泄露了。' },
        isCritical: true,
        choices: [
            { text: { en: 'Claim it\'s AI generated.', zh: '声称这是 AI 生成的。' }, outcomeHint: { en: 'Modern problems require modern lies.', zh: '现代问题需要现代谎言。' }, requiresDiceRoll: { stat: 'integrity', difficulty: 15, outcomes: { 'Critical Success': { scandalChange: -10 }, 'Success': { scandalChange: -5 }, 'Failure': { scandalChange: 10, pollsChange: -5 }, 'Critical Failure': { scandalChange: 20, pollsChange: -10 } } }, baseEffects: {} },
            { text: { en: 'Ignore it.', zh: '无视它。' }, outcomeHint: { en: 'Hope it blows over.', zh: '希望它过去。' }, baseEffects: { pollsChange: -5, momentumChange: -5 } }
        ]
    }
];

export const PARTY_SPECIFIC_EVENTS: { [key in Party]: GameEvent[] } = {
    [Party.Republican]: [
        {
            id: 'gun_rights_rally',
            title: { en: 'Gun Rights Rally', zh: '拥枪权集会' },
            description: { en: 'A major 2nd Amendment group invites you to speak.', zh: '一个主要的第二修正案团体邀请你演讲。' },
            choices: [
                { text: { en: 'Give a fiery pro-gun speech.', zh: '发表激烈的拥枪演讲。' }, outcomeHint: { en: 'Lock down the base.', zh: '锁定基础选民。' }, baseEffects: { pollsChange: 3, influenceChange: 5, opponentPollsChange: -1 } },
                { text: { en: 'Decline to appear.', zh: '拒绝出席。' }, outcomeHint: { en: 'Pivot to the center.', zh: '转向中间派。' }, baseEffects: { pollsChange: -2, opponentPollsChange: 2 } }
            ]
        }
    ],
    [Party.Democrat]: [
        {
            id: 'climate_summit',
            title: { en: 'Global Climate Summit', zh: '全球气候峰会' },
            description: { en: 'Activists demand you pledge to ban fracking.', zh: '激进分子要求你承诺禁止水力压裂。' },
            choices: [
                { text: { en: 'Pledge the ban.', zh: '承诺禁止。' }, outcomeHint: { en: 'Win the progressives, lose Pennsylvania.', zh: '赢得进步派，失去宾夕法尼亚。' }, baseEffects: { pollsChange: 2, electoralMapUpdates: [{ state: 'PA', affiliation: StateAffiliation.Opponent }] } },
                { text: { en: 'Propose a balanced approach.', zh: '提出平衡的方法。' }, outcomeHint: { en: 'Safe, but uninspiring.', zh: '安全，但不令人鼓舞。' }, baseEffects: { politicalCapitalChange: 2 } }
            ]
        }
    ]
};

export const SCHEDULED_EVENTS: { week: number, event: GameEvent }[] = [
    { week: 15, event: { id: 'presidential_debate_1', title: { en: 'First Presidential Debate', zh: '首场总统辩论' }, description: { en: 'The nation tunes in for the first head-to-head debate. This is a high-stakes opportunity to land a decisive blow or suffer a major gaffe.', zh: '全国关注首场面对面的辩论。这是一个进行决定性打击或遭受重大失态的高风险机会。' }, isDebateQuestion: true, choices: [ { text: { en: 'Prepare for the debate.', zh: '准备辩论。' }, outcomeHint: { en: 'You will face a series of policy questions.', zh: '您将面临一系列政策问题。' }, baseEffects: {} }, { text: { en: 'Prepare for the debate.', zh: '准备辩论。' }, outcomeHint: { en: 'You will face a series of policy questions.', zh: '您将面临一系列政策问题。' }, baseEffects: {} } ] } }
];

export const SIGNATURE_POLICIES = [
    { id: 'new_deal_21', name: { en: "21st Century New Deal", zh: "21世纪新政" }, description: { en: "Launch a massive public works and green energy program. Hugely popular and creates jobs, but astronomically expensive.", zh: "启动大规模公共工程和绿色能源计划。广受欢迎并创造就业机会，但耗资巨大。" }, cost: { politicalCapital: 30, treasury: 100 }, effects: { momentumChange: 25, pollsChange: 8, mediaAttentionChange: 15, scandalChange: 5 } },
    { id: 'judiciary_reform', name: { en: "Appoint Federal Judiciary", zh: "任命联邦司法机构" }, description: { en: "Use your mandate to appoint a slate of federal judges who align with your ideology, securing a generational impact.", zh: "利用您的授权任命一批与您意识形态一致的联邦法官，确保产生代际影响。" }, cost: { politicalCapital: 25, influence: 20 }, effects: { addBuff: { id: 'judiciary_legacy', name: { en: 'Judiciary Legacy', zh: '司法遗产' }, description: { en: 'Your judicial appointments provide a permanent boost to your integrity.', zh: '您的司法任命为您的诚信提供了永久的提升。' }, turnsRemaining: 999, effects: { integrityChange: 2 } }, momentumChange: 5 } },
    { id: 'universal_healthcare', name: { en: "Universal Healthcare Act", zh: "全民医疗法案" }, description: { en: "Attempt to pass a landmark universal healthcare bill. A monumental political battle that will define your legacy.", zh: "尝试通过具有里程碑意义的全民医疗法案。一场将定义您政治遗产的巨大政治斗争。" }, cost: { politicalCapital: 35, treasury: 50 }, effects: { pollsChange: 12, opponentPollsChange: -8, scandalChange: 10, mediaAttentionChange: 20 } },
    { id: 'deregulation_blitz', name: { en: "Deregulation Blitz", zh: "放松管制闪电战" }, description: { en: "Aggressively cut regulations across the board to spur economic activity. Businesses will love it, but it comes with risks.", zh: "全面积极削减法规以刺激经济活动。商界会喜欢，但也伴随着风险。" }, cost: { politicalCapital: 20 }, effects: { treasuryChange: 40, scandalChange: 8, opponentPollsChange: -3 } }
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
    { id: 'bullet_dodged', icon: '🕶️', title: { en: 'Bulletproof', zh: '防弹' }, description: { en: 'Survived a literal assassination attempt and kept speaking. Teddy Roosevelt would be proud.', zh: '在遭遇暗杀企图后幸存下来并继续演讲。泰迪·罗斯福会为你感到骄傲。' } },
    { id: 'fly_lord', icon: '🪰', title: { en: 'Lord of the Flies', zh: '苍蝇王' }, description: { en: 'A fly landed on your head during a debate and you didn\'t even notice.', zh: '辩论中一只苍蝇落在你头上，你甚至没有注意到。' } },
    { id: 'four_seasons', icon: '🍂', title: { en: 'Total Landscaping', zh: '全景观' }, description: { en: 'Held a major press conference at a landscaping company instead of a luxury hotel.', zh: '在园林绿化公司而不是豪华酒店举行了大型新闻发布会。' } },
    { id: 'tan_suit', icon: '👔', title: { en: 'Fashion Police', zh: '时尚警察' }, description: { en: 'Sparked a national controversy by wearing a tan suit.', zh: '因穿棕褐色西装引发了全国争议。' } },
    { id: 'covfefe', icon: '📱', title: { en: 'Covfefe', zh: 'Covfefe' }, description: { en: 'Tweeted nonsense at 3 AM and the world tried to decode it.', zh: '凌晨3点发了胡言乱语的推文，全世界都在试图解读它。' } },
    { id: 'please_clap', icon: '👏', title: { en: 'Please Clap', zh: '请鼓掌' }, description: { en: 'Begged a silent crowd for applause. It was painful.', zh: '恳求沉默的人群鼓掌。这很痛苦。' } },
    { id: 'watergate', icon: '🕵️', title: { en: 'Plumber', zh: '水管工' }, description: { en: 'Caught breaking into opponent HQ. A classic blunder.', zh: '被抓到闯入对手总部。一个经典的错误。' } },
    { id: 'binders', icon: '📒', title: { en: 'Binder Full', zh: '满文件夹' }, description: { en: 'Made a weird comment about binders full of women.', zh: '发表了关于装满女性的活页夹的奇怪评论。' } },
    { id: 'read_my_lips', icon: '💋', title: { en: 'Read My Lips', zh: '看我的嘴型' }, description: { en: 'Broke a major campaign promise immediately.', zh: '立即违背了一项主要的竞选承诺。' } },
    { id: 'howard_scream', icon: '😱', title: { en: 'The Scream', zh: '尖叫' }, description: { en: 'Got a little too excited at a rally and made a weird noise.', zh: '在集会上有点太兴奋了，发出了奇怪的声音。' } }
];

export const INITIAL_LOCAL_PROBLEMS: LocalProblem[] = [
    {
        id: 'mi_water_crisis', stateAbbr: 'MI', title: { en: 'Flint Water Crisis 2.0', zh: '弗林特水危机 2.0' },
        description: { en: 'Lead pipes in a major city are contaminating water. Locals are furious at federal inaction.', zh: '一个主要城市的铅管正在污染水源。当地人对联邦政府的不作为感到愤怒。' },
        resolved: false,
        choices: [
            { text: { en: 'Send Federal Aid Immediately', zh: '立即发送联邦援助' }, outcomeHint: { en: 'Costly, but secures the state.', zh: '昂贵，但能确保该州的支持。' }, buff: { name: { en: 'Clean Water Hero', zh: '净水英雄' }, effect: { electoralMapUpdates: [{ state: 'MI', affiliation: StateAffiliation.Player }] }, turnsRemaining: 99 } },
            { text: { en: 'Form a Committee', zh: '成立委员会' }, outcomeHint: { en: 'Cheap, but ineffective.', zh: '便宜，但无效。' }, buff: { name: { en: 'Bureaucratic Delay', zh: '官僚延误' }, effect: { scandalChange: 2 }, turnsRemaining: 2 } }
        ]
    },
    {
        id: 'ca_wildfires', stateAbbr: 'CA', title: { en: 'Wildfire Season', zh: '野火季节' },
        description: { en: 'Massive wildfires are threatening suburbs in Northern California.', zh: '大规模野火正在威胁北加州的郊区。' },
        resolved: false,
        choices: [
            { text: { en: 'Declare State of Emergency', zh: '宣布紧急状态' }, outcomeHint: { en: 'Mobilize resources to help.', zh: '动员资源提供帮助。' }, buff: { name: { en: 'Crisis Leader', zh: '危机领袖' }, effect: { pollsChange: 2 }, turnsRemaining: 5 } },
            { text: { en: 'Blame State Management', zh: '指责州政府管理' }, outcomeHint: { en: 'Politicize the disaster.', zh: '将灾难政治化。' }, buff: { name: { en: 'Political Firestorm', zh: '政治风暴' }, effect: { mediaAttentionChange: 5, opponentPollsChange: -1 }, turnsRemaining: 3 } }
        ]
    }
];

export const OCTOBER_SURPRISES: any[] = [];
