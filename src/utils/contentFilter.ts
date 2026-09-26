export type FilterCategory = 'profanity' | 'ad' | 'porn' | 'violence';

const CN_WORDS: Record<FilterCategory, string[]> = {
  profanity: [
    '傻逼', '煞笔', '沙比', '傻缺', '傻冒', '二逼', '畜生', '蠢货', '白痴', '神经病', '脑瘫', '有病吧', '脑子有病',
    '妈卖批', '马卖批', '草泥马', '操你', '艹你', 'cnm', 'nmsl', 'mmp', '去死', '滚蛋', '混蛋', '混账',
    '王八蛋', '王八', '龟孙', '兔崽子', '放屁', '狗屎', '贱人', '贱货', '婊子', '人渣', '烂货', '不要脸', '无耻',
    '特么', '玛的', '你妈的', '妈逼', '垃圾博客', '垃圾网站', '烂博客',
    // 同音/拼音变体
    '傻b', '啥比', '傻碧', '沙雕', '装逼', '装b', '卧槽', '我操', '我草', '握草', '我尼玛', '尼玛的',
    '他妈的', '马的', '脑残', '喷子', '绿茶婊', '贱婢', '蠢猪', '废物博客', 'shabi', 'wocao', 'mabi', 'tmd', 'nmd',
  ],
  ad: [
    '加微信', '加v信', '威信', '薇信', 'vx:', 'vx：', '加群', '扫码', '私聊', '私信我', '扣扣', '微商', '招代理', '招商加盟',
    '代开发票', '办证刻章', '办证', '代刷', '刷单', '返利', '返佣', '推广链接', '日结兼职', '兼职招聘', '一件代发',
    '六合彩', '时时彩', '博彩', '菠菜网', '赌场', '网赌', '彩票', '真人视讯', '炸金花', '牛牛', '下注', '投注', '送彩金', '首存',
    '上分', '点击链接', '免费领', '低价出售', '贷款', '网贷', '高利贷', '套现', '征信修复', 'pos机',
    '社工库', '撞库', '接码', '实名号', '定位找人', '查开房记录', '私家侦探',
    // 同音变体
    '微芯', '徽信', '加裙', '私我', '代充',
  ],
  porn: [
    '色情', '黄图', '黄网', '黄聊', '涩涩', '裸聊', '裸照', '约炮', '约p', '一夜情', '援交', '嫖娼', '卖淫',
    '春药', '壮阳', '延时药', '伟哥', '性奴', '毛片', 'av女优', '无码', '偷拍', '不雅视频', '开房', '换妻', '情趣用品', '成人用品',
    // 同音/谐音变体
    '约啪', '打飞机', '自慰', '黄片', '聊骚', 'h视频',
  ],
  violence: [
    '杀人', '砍人', '砍死', '捅死', '杀光', '灭门', '弄死你', '杀了你', '枪支', '弹药', '管制刀具', '开刃', '三棱刀', '弓弩',
    '炸药', '雷管', '炸弹制作', '氰化物', '剧毒', '投毒', '下毒', '毒品', '冰毒', '海洛因', '大麻叶', '恐袭', '恐怖袭击', '恐怖组织', '虐待动物', '虐猫',
    '诛九族', '断子绝孙', '满门抄斩',
  ],
};

const EN_WORD_RE = [
  {
    cat: 'profanity' as const,
    re: /\b(fuck|fucking|motherfuck|shit|bullshit|asshole|bastard|bitch|cunt|dick|dickhead|prick|cock|piss|crap|damn|jerkoff|slut|whore|wtf|sb)\b/,
  },
  { cat: 'porn' as const, re: /\b(porn|xxx|onlyfans|jav)\b/ },
  { cat: 'ad' as const, re: /\b(whatsapp)\b/ },
];

// 符号拆分规避（f*ck / sh!t / b!tch / c.n.m）：仅允许字母间夹标点，不允许空格，避免 “S hit” 误伤
const P = '[^\\w\\s]';
const EN_FUZZY_RE: { cat: FilterCategory; re: RegExp }[] = [
  { cat: 'profanity', re: new RegExp(`\\bf${P}*u?${P}*c${P}*k\\b`) },
  { cat: 'profanity', re: new RegExp(`\\bs${P}*h${P}*i?${P}*t\\b`) },
  { cat: 'profanity', re: new RegExp(`\\bb${P}*i?${P}*t${P}*c${P}*h\\b`) },
  { cat: 'profanity', re: new RegExp(`\\bc${P}*n${P}*m\\b`) },
];

function normalize(text: string): { lower: string; tight: string } {
  const lower = text.toLowerCase();
  const tight = lower.replace(/[\s\u3000.*·\-_~|\\+＝=]+/g, '');
  return { lower, tight };
}

export function inspectText(text: string): Set<FilterCategory> {
  const hits = new Set<FilterCategory>();
  if (!text) return hits;
  const { lower, tight } = normalize(text);

  for (const [cat, words] of Object.entries(CN_WORDS) as [FilterCategory, string[]][]) {
    for (const w of words) {
      if (tight.includes(w.toLowerCase())) {
        hits.add(cat);
        break;
      }
    }
  }

  for (const { cat, re } of EN_WORD_RE) {
    if (re.test(lower)) hits.add(cat);
  }

  for (const { cat, re } of EN_FUZZY_RE) {
    if (re.test(lower)) hits.add(cat);
  }

  // 广告特征：外部链接、连续 6 位以上数字（QQ号/手机号引流）；数字检测不压缩原文，避免误伤日期
  if (/https?:\/\/|www\.|\.xyz|\.top\b/.test(lower) || /\d{6,}/.test(lower)) hits.add('ad');

  return hits;
}

export function inspectMessage(name: string, content: string): FilterCategory[] {
  const hits = new Set<FilterCategory>();
  for (const hit of inspectText(name)) hits.add(hit);
  for (const hit of inspectText(content)) hits.add(hit);
  return [...hits];
}
