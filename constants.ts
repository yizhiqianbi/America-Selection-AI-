import { Talent } from './types';

export const TOTAL_STAT_POINTS = 20;
export const MIN_STAT_POINTS = 1;
export const MAX_STAT_POINTS = 10;
export const TALENTS_TO_SHOW = 10;
export const TALENTS_TO_PICK = 3;

export const ALL_TALENTS: Talent[] = [
    { name: "亿万富翁", description: "你非常富有，开局就拥有巨大的资金优势。" },
    { name: "媒体宠儿", description: "媒体喜欢你。你更容易获得支持，并且不易受小丑闻影响。" },
    { name: "基层组织者", description: "你具有动员志愿者和选民的天赋。" },
    { name: "政策专家", description: "你对政策的深刻理解在辩论中给选民留下深刻印象。" },
    { name: "不粘锅候选人", description: "丑闻似乎就是沾不上你，能降低丑闻风险。" },
    { name: "演讲天才", description: "你的演讲堪称传奇，能极大地提升你的吸引力。" },
    { name: "旧财富人脉", description: "你的家族关系为你打开了通往强大捐助者的大门。" },
    { name: "战争英雄", description: "你的兵役经历让你在诚信和公众信任方面有显著优势。" },
    { name: "好莱坞演员", description: "你过去的职业生涯让你在公众形象和魅力方面具有优势。" },
    { name: "首任州长", description: "你拥有行政经验，提升了你的组织能力。" },
    { name: "华盛顿圈内人", description: "你知道体制如何运作，更容易建立联盟。" },
    { name: "免死金牌", description: "一份神秘的礼物。你将能在一次暗杀企图中幸存。" },
    { name: "局外人的魅力", description: "选民认为你是传统政客中的一股清流。" },
    { name: "辩论大师", description: "你可以在现场辩论中轻松驳倒对手的论点。" },
    { name: "社交媒体达人", description: "你知道如何利用在线平台来发挥自己的优势。" },
];
