// 博客数据 — 文章、分类、图文内容块

export interface Block {
  type: 'p' | 'h2' | 'h3' | 'img' | 'quote' | 'code' | 'list';
  // p / h2 / h3 / quote / code 的文本（zh/en 双语）
  textZh?: string;
  textEn?: string;
  // img 的 URL 和 caption
  img?: string;
  captionZh?: string;
  captionEn?: string;
  // list 的条目
  itemsZh?: string[];
  itemsEn?: string[];
  // code 的语言
  lang?: string;
}

export interface Article {
  id: number;
  slug: string;
  titleZh: string;
  titleEn: string;
  excerptZh: string;
  excerptEn: string;
  date: string;
  readMin: number;
  catZh: string;
  catEn: string;
  catKey: string;
  tags: string[];
  cover: string;       // 封面图 URL
  author: string;
  authorAvatar: string;
  blocks: Block[];
}

export const img = (prompt: string, size = 'landscape_16_9') =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;

export const CATEGORIES = [
  { zh: '首页', en: 'Home', key: 'home' },
  { zh: '作者志', en: 'Journal', key: 'journal' },
  { zh: '技栈', en: 'Stack', key: 'stack' },
  { zh: '图展', en: 'Gallery', key: 'gallery' },
  { zh: '资源', en: 'Resources', key: 'resources' },
];

export const ARTICLES: Article[] = [
  {
    id: 1,
    slug: 'liquid-glass-design',
    titleZh: '液态玻璃：模糊即语言',
    titleEn: 'Liquid Glass: Blur as Language',
    excerptZh: '从 iOS 26 的 Liquid Glass 出发，聊聊 backdrop-filter、折射与边框高光如何构建数字层次。',
    excerptEn: 'From iOS 26 Liquid Glass — backdrop-filter, refraction and rim light that build hierarchy.',
    date: '2026-09-08',
    readMin: 8,
    catZh: '图展',
    catEn: 'Gallery',
    catKey: 'gallery',
    tags: ['glass', 'UI', 'CSS'],
    cover: img('A serene glassmorphism UI design showcase, frosted glass panels floating over a vibrant gradient background, soft blurred light blobs, minimal modern aesthetic, pastel tones'),
    author: 'Lin',
    authorAvatar: img('A minimalist avatar icon, abstract geometric face, indigo and purple gradient, flat design', 'square'),
    blocks: [
      {
        type: 'p',
        textZh: '第一次看到 iOS 26 的 Liquid Glass 时，我意识到模糊不再是一种装饰，而是一种语言。它告诉用户：这块内容是"浮"在背景之上的，你透过它仍能看到后面的世界，但它本身又是独立、可触碰的。',
        textEn: 'When I first saw iOS 26 Liquid Glass, I realized blur is no longer decoration — it is a language. It tells the user: this content floats above the background; you can still see the world behind it, yet it is its own touchable surface.',
      },
      {
        type: 'img',
        img: img('Close-up of a frosted glass card hovering over a colorful blurred background, light refracting at the edges, rim light highlighting the border, photorealistic render'),
        captionZh: '玻璃面板的边缘高光让它看起来真的"有厚度"。',
        captionEn: 'The rim light on the glass panel edge makes it look genuinely thick.',
      },
      {
        type: 'h2',
        textZh: 'backdrop-filter 的物理直觉',
        textEn: 'Physical intuition of backdrop-filter',
      },
      {
        type: 'p',
        textZh: 'backdrop-filter 做的事情很简单：把它背后那块区域做模糊。但关键是，"背后"是指 z 轴上比它低的元素。如果背景是静止的，模糊出来的效果就是死的；如果背景有动态光斑在缓慢移动，模糊后透出来的颜色就在不断变化——这才是"液态"感的来源。',
        textEn: 'backdrop-filter does one simple thing: it blurs whatever is behind it. The key is that "behind" means lower on the z-axis. If the background is static, the blur looks dead; if colorful blobs drift slowly behind it, the colors bleeding through keep changing — that is where "liquid" comes from.',
      },
      {
        type: 'code',
        lang: 'css',
        textZh: `.glass {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 18px;
}`,
        textEn: `.glass {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 18px;
}`,
      },
      {
        type: 'h2',
        textZh: '边框高光：让玻璃有"边"',
        textEn: 'Rim light: giving glass an edge',
      },
      {
        type: 'p',
        textZh: '纯模糊会让面板看起来像一团雾。真正的玻璃是有边缘的——光线在边缘处折射，形成一道细高光。用 mask-composite 在边框上叠一道渐变，就能模拟这种 rim light。',
        textEn: 'Pure blur makes a panel look like fog. Real glass has edges — light refracts at the edge, forming a thin highlight. Layering a gradient border with mask-composite simulates this rim light.',
      },
      {
        type: 'quote',
        textZh: '模糊让玻璃透明，边框让玻璃有形。两者缺一不可。',
        textEn: 'Blur makes glass transparent; the border gives it form. Neither can be missing.',
      },
      {
        type: 'h3',
        textZh: '暗色模式的调参陷阱',
        textEn: 'Dark mode tuning pitfalls',
      },
      {
        type: 'p',
        textZh: '暗色模式下最容易犯的错是：直接把亮色的白色半透明背景搬过来。结果面板灰蒙蒙的，像一层脏塑料。正确做法是大幅降低背景透明度（0.06–0.1），同时提高模糊半径，让暗色背景的细节能透出来。',
        textEn: 'The most common mistake in dark mode: reusing the light-theme white-translucent background. The panel ends up greyish, like dirty plastic. The fix is to drastically lower background opacity (0.06–0.1) and increase the blur radius, so dark-background detail can bleed through.',
      },
      {
        type: 'list',
        itemsZh: [
          '背景透明度：亮色 0.3–0.4，暗色 0.06–0.1',
          '模糊半径：亮色 20px，暗色 25–30px',
          '边框：亮色用白色高光，暗色用极淡白色',
          '阴影：暗色需要更深的阴影来制造层次',
        ],
        itemsEn: [
          'Background opacity: light 0.3–0.4, dark 0.06–0.1',
          'Blur radius: light 20px, dark 25–30px',
          'Border: white highlight for light, faint white for dark',
          'Shadow: dark mode needs deeper shadows for depth',
        ],
      },
    ],
  },
  {
    id: 2,
    slug: 'framer-motion-practice',
    titleZh: '让组件"活"起来：Framer Motion 实战',
    titleEn: 'Bringing Components to Life: Framer Motion',
    excerptZh: '从 AnimatePresence 到 layoutId，五个让 React 页面高级起来的动画技巧。',
    excerptEn: 'Five motion tricks that elevate any React page.',
    date: '2026-08-22',
    readMin: 10,
    catZh: '技栈',
    catEn: 'Stack',
    catKey: 'stack',
    tags: ['react', 'framer-motion', 'animation'],
    cover: img('Abstract representation of motion design, flowing ribbons of light tracing elegant curves, dynamic energy, dark background with vibrant accent colors, modern digital art'),
    author: 'Lin',
    authorAvatar: img('A minimalist avatar icon, abstract geometric face, indigo and purple gradient, flat design', 'square'),
    blocks: [
      {
        type: 'p',
        textZh: '动画不是装饰。好的动画是在用时间这个维度去解释界面——告诉用户东西从哪来、到哪去、为什么变了。Framer Motion 是我在 React 里用得最顺手的动画库，下面是五个我每天都在用的技巧。',
        textEn: 'Motion is not decoration. Good motion uses the dimension of time to explain the interface — telling the user where things come from, where they go, why they changed. Framer Motion is the animation library I reach for most in React. Here are five tricks I use every day.',
      },
      {
        type: 'h2',
        textZh: '1. AnimatePresence：退出动画',
        textEn: '1. AnimatePresence: exit animations',
      },
      {
        type: 'p',
        textZh: 'React 的卸载是同步的——组件一旦从树里移除就立刻消失。AnimatePresence 包裹一层后，组件在真正消失前会先播放 exit 动画。这是做路由切换、弹窗关闭的基础。',
        textEn: 'React unmounting is synchronous — once removed from the tree, the component vanishes instantly. Wrapping with AnimatePresence lets the component play its exit animation before truly disappearing. This is the foundation of route transitions and modal closing.',
      },
      {
        type: 'code',
        lang: 'tsx',
        textZh: `<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
  >
    {children}
  </motion.div>
</AnimatePresence>`,
        textEn: `<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
  >
    {children}
  </motion.div>
</AnimatePresence>`,
      },
      {
        type: 'img',
        img: img('A smooth page transition animation, two overlapping translucent panels sliding past each other with motion blur trails, elegant curve, indigo accent'),
        captionZh: '路由切换时的 blur + y 过渡，像原生 App 打开新页面。',
        captionEn: 'Blur + y transition on route change, like a native app opening.',
      },
      {
        type: 'h2',
        textZh: '2. layoutId：共享元素过渡',
        textEn: '2. layoutId: shared element transition',
      },
      {
        type: 'p',
        textZh: '列表里点开一张卡片，卡片"飞"到详情页的位置变成大图——这种效果以前要写一堆 FLIP 逻辑。Framer Motion 给两个元素同一个 layoutId，库会自动计算位置差并做过渡。',
        textEn: 'Clicking a card in a list and having it "fly" to the detail page and become a large image — this used to require a pile of FLIP logic. Give two elements the same layoutId and the library calculates the position delta and animates it automatically.',
      },
      {
        type: 'h2',
        textZh: '3. useInView：滚动触发',
        textEn: '3. useInView: scroll trigger',
      },
      {
        type: 'p',
        textZh: '页面很长的时，不能让所有元素一上来就播放动画——下面的元素用户还没看到就播完了。useInView 配合 once: true，元素第一次进入视口时才触发，而且只触发一次。',
        textEn: 'When a page is long, you cannot let every element animate on mount — by the time the user scrolls down, the animation is over. useInView with once: true triggers the first time the element enters the viewport, and only that once.',
      },
      {
        type: 'quote',
        textZh: '动画的最高境界是用户察觉不到动画，只觉得"这个界面很顺"。',
        textEn: 'The highest form of animation is when the user does not notice it — they just feel the interface is smooth.',
      },
      {
        type: 'h2',
        textZh: '4. stagger：错峰入场',
        textEn: '4. stagger: staggered entrance',
      },
      {
        type: 'p',
        textZh: '列表里的项一个接一个地出现，比同时出现要有节奏感得多。做法很简单：给每一项加一个 index * 0.05 的 delay。',
        textEn: 'Items in a list appearing one after another feels far more rhythmic than appearing all at once. The trick is simple: give each item a delay of index * 0.05.',
      },
      {
        type: 'h2',
        textZh: '5. reduced-motion：尊重无障碍',
        textEn: '5. reduced-motion: respect accessibility',
      },
      {
        type: 'p',
        textZh: '有一部分用户在系统里开启了"减少动态效果"。Framer Motion 会自动读取这个偏好，把动画时长压到极短。但你仍应避免用动画传递关键信息——动画是锦上添花，不是唯一通道。',
        textEn: 'Some users enable "reduce motion" in their system. Framer Motion reads this automatically and compresses animation duration. Still, never use animation as the sole channel for critical information — motion is icing, not the cake.',
      },
    ],
  },
  {
    id: 3,
    slug: 'weekend-in-kyoto',
    titleZh: '京都周末：在时间慢下来的城市里',
    titleEn: 'A Kyoto Weekend: In a City Where Time Slows',
    excerptZh: '深秋的京都，沿着哲学之道走了三个下午。照片比文字更适合记录这座城市。',
    excerptEn: 'Kyoto in late autumn, three afternoons along the Philosopher\'s Path. Photos suit this city better than words.',
    date: '2026-07-14',
    readMin: 6,
    catZh: '资源',
    catEn: 'Resources',
    catKey: 'resources',
    tags: ['kyoto', 'photo', 'autumn'],
    cover: img('A serene Kyoto temple pathway in autumn, maple leaves in red and gold, soft morning mist, traditional wooden architecture, photographic, warm tones'),
    author: 'Lin',
    authorAvatar: img('A minimalist avatar icon, abstract geometric face, indigo and purple gradient, flat design', 'square'),
    blocks: [
      {
        type: 'p',
        textZh: '京都的秋天是慢的。不是那种无所事事的慢，而是每一片叶子落地都被听见的慢。我订了三晚的民宿，没有行程，只有一个念头：沿着哲学之道走，走到哪算哪。',
        textEn: 'Kyoto in autumn is slow. Not the slow of idleness, but the slow where every leaf hitting the ground is heard. I booked three nights at a minshuku with no itinerary, only one thought: walk the Philosopher\'s Path, go wherever my feet take me.',
      },
      {
        type: 'img',
        img: img('Stone path winding through a maple forest in Kyoto, red and orange autumn leaves carpeting the ground, dappled sunlight, peaceful atmosphere, travel photography'),
        captionZh: '哲学之道旁的小径，落叶铺了一地。',
        captionEn: 'A side path off the Philosopher\'s Path, carpeted in fallen leaves.',
      },
      {
        type: 'h2',
        textZh: '第一个下午：叶子与光',
        textEn: 'First afternoon: leaves and light',
      },
      {
        type: 'p',
        textZh: '下午三点，阳光斜着穿过枫叶，在地面上投下细碎的影。我蹲在水渠边看了半小时的水——水很浅，能看到底，落叶一片片漂过去，像慢吞吞的船队。这半小时比我看过的任何电影都安静。',
        textEn: 'Three in the afternoon, sunlight slants through the maples, casting fine shadows on the ground. I crouched by the canal and watched the water for half an hour — it is shallow, you can see the bottom, leaves drift past one by one like a slow convoy. That half hour was quieter than any film I have seen.',
      },
      {
        type: 'img',
        img: img('A close-up of a shallow stone canal with autumn leaves floating on the water surface, sunlight reflecting, Kyoto, peaceful, photographic'),
        captionZh: '水渠里的落叶，像一支慢吞吞的船队。',
        captionEn: 'Leaves in the canal, like a slow convoy.',
      },
      {
        type: 'h2',
        textZh: '第二个下午：无名的小寺',
        textEn: 'Second afternoon: an unnamed temple',
      },
      {
        type: 'p',
        textZh: '走岔了一条路，撞见一座连名字都没挂的小寺。院子不大，只有一棵银杏，黄到发亮。住持在廊下擦茶碗，看见我，点了点头，继续擦。我在廊上坐了四十分钟，没人说话，只有风。',
        textEn: 'I took a wrong turn and stumbled onto a small temple without even a nameplate. The yard is small, only one ginkgo tree, yellow to the point of glowing. The abbot was wiping tea bowls under the eaves; he saw me, nodded, kept wiping. I sat on the engawa for forty minutes. No one spoke. Only wind.',
      },
      {
        type: 'quote',
        textZh: '旅行的意义有时不在于看见新东西，而在于被允许安静地坐着。',
        textEn: 'Sometimes travel is not about seeing new things, but being allowed to sit quietly.',
      },
      {
        type: 'h2',
        textZh: '第三个下午：雨',
        textEn: 'Third afternoon: rain',
      },
      {
        type: 'p',
        textZh: '最后一天下雨了。我没有打伞，哲学之道没什么人，雨水打在枫叶上发出一种很轻的沙沙声。湿透的石板路反着天光，像一条倒过来的河。我想，京都大概就是为这种下午准备的。',
        textEn: 'It rained on the last day. I did not take an umbrella. The Philosopher\'s Path was nearly empty; rain hitting the maples made a very fine rustle. The wet stone path reflected the sky, like an upside-down river. I thought: Kyoto was made for afternoons like this.',
      },
      {
        type: 'img',
        img: img('Rainy stone path in Kyoto, wet cobblestones reflecting soft sky light, autumn maple leaves in muted red, misty atmosphere, moody travel photography'),
        captionZh: '湿透的石板路，像一条倒过来的河。',
        captionEn: 'The soaked stone path, like an upside-down river.',
      },
    ],
  },
  {
    id: 4,
    slug: 'writing-as-thinking',
    titleZh: '写作即思考',
    excerptZh: '不是先想清楚再写，而是写着写着才想清楚。这篇文章本身就是证据。',
    excerptEn: 'Not think-first-write-later, but write-to-think. This essay is its own evidence.',
    titleEn: 'Writing Is Thinking',
    date: '2026-06-03',
    readMin: 5,
    catZh: '作者志',
    catEn: 'Journal',
    catKey: 'journal',
    tags: ['writing', 'thinking'],
    cover: img('A minimalist desk scene with a fountain pen resting on an open notebook, soft window light, warm paper tones, shallow depth of field, contemplative mood'),
    author: 'Lin',
    authorAvatar: img('A minimalist avatar icon, abstract geometric face, indigo and purple gradient, flat design', 'square'),
    blocks: [
      {
        type: 'p',
        textZh: '我经常被问："你写之前要想多久？"我的诚实答案是：想的时间约等于写的十分之一。不是我想清楚了才写，是我写着写着才想清楚的。',
        textEn: 'I am often asked: "How long do you think before writing?" My honest answer: thinking takes about a tenth of the writing time. It is not that I think clearly first and then write — it is that I only think clearly while writing.',
      },
      {
        type: 'h2',
        textZh: '大脑是草稿，文字是终稿',
        textEn: 'The brain is a draft; words are the final',
      },
      {
        type: 'p',
        textZh: '脑子里的想法像水——看着有形，一抓就散。你觉得自己想清楚了，其实只是一团模模糊糊的"差不多"。只有把它写成句子，逼自己选词、排逻辑、填主语，那团雾才会凝结成冰。',
        textEn: 'Thoughts in the head are like water — they look shaped, but scatter when you grab them. You feel you have thought it through, but it is really just a fuzzy "roughly so". Only by writing it into sentences, forcing yourself to choose words, order logic, supply subjects — only then does that fog condense into ice.',
      },
      {
        type: 'img',
        img: img('Abstract visualization of thoughts condensing from fog into solid form, ink drops falling onto paper and crystallizing, dark and light contrast, artistic'),
        captionZh: '想法从雾到冰的过程。',
        captionEn: 'The process of a thought going from fog to ice.',
      },
      {
        type: 'quote',
        textZh: '没写下来之前，你并不真的拥有那个想法。',
        textEn: 'Until you write it down, you do not really own the thought.',
      },
      {
        type: 'h2',
        textZh: '卡住的时候怎么办',
        textEn: 'What to do when stuck',
      },
      {
        type: 'p',
        textZh: '卡住不是没想法，是想法还没准备好被句子审判。这时候我会做两件事：一是把脑子里所有碎片倒出来，不讲究语法；二是去散步。散步时脑子里会冒出一句完整的话——那就是文章真正的开头。',
        textEn: 'Being stuck is not having no thoughts, but the thoughts not being ready for the judgment of sentences. When stuck I do two things: first, dump every fragment in my head onto the page, grammar be damned; second, go for a walk. A complete sentence always surfaces during the walk — that is the real opening of the piece.',
      },
      {
        type: 'list',
        itemsZh: [
          '允许自己写出垃圾，垃圾是肥料',
          '写不动就去走，别硬坐',
          '把开头留到最后再改',
          '改三遍比写一遍重要',
        ],
        itemsEn: [
          'Allow yourself to write garbage — garbage is fertilizer',
          'When stuck, walk — do not force-sit',
          'Save the opening for last',
          'Three rounds of editing matter more than one round of writing',
        ],
      },
    ],
  },
  {
    id: 5,
    slug: 'my-2026-toolkit',
    titleZh: '我的 2026 开发者工具箱',
    excerptZh: '从编辑器到部署，聊聊每天都离不开的那些小工具。',
    excerptEn: 'From editor to deploy — the tiny tools I reach for every day.',
    titleEn: 'My 2026 Developer Toolkit',
    date: '2026-04-18',
    readMin: 7,
    catZh: '技栈',
    catEn: 'Stack',
    catKey: 'stack',
    tags: ['tools', 'devtools'],
    cover: img('A clean minimalist developer workspace, laptop screen showing code editor, desk with mechanical keyboard and a cup of coffee, soft natural light, warm tones, modern setup'),
    author: 'Lin',
    authorAvatar: img('A minimalist avatar icon, abstract geometric face, indigo and purple gradient, flat design', 'square'),
    blocks: [
      {
        type: 'p',
        textZh: '每年我都会整理一次自己常用的工具。不是推荐清单，是给自己看的一面镜子——工具的选择会暴露你这一年真正在意什么。',
        textEn: 'Every year I take stock of the tools I use. Not a recommendation list, but a mirror — your choice of tools exposes what you actually cared about this year.',
      },
      {
        type: 'h2',
        textZh: '编辑器：仍然是我离不开的根',
        textEn: 'Editor: still the root I cannot leave',
      },
      {
        type: 'p',
        textZh: '试过几次切换到别的编辑器，一周内都跑回来了。肌肉记忆是真实的资产——我不想为了"尝鲜"每年重新学一遍快捷键。真正让我留下的不是功能，是生态。',
        textEn: 'I tried switching editors a few times, always came back within a week. Muscle memory is real equity — I will not relearn shortcuts every year for novelty. What keeps me is not features, it is the ecosystem.',
      },
      {
        type: 'img',
        img: img('A close-up of a code editor screen with syntax highlighting, dark theme, clean typography, cursor blinking on a line of TypeScript code, shallow depth of field'),
        captionZh: '编辑器是开发者每天看最久的东西。',
        captionEn: 'The editor is the thing a developer stares at most each day.',
      },
      {
        type: 'h2',
        textZh: '终端：把重复的事写成脚本',
        textEn: 'Terminal: script the repetitive',
      },
      {
        type: 'p',
        textZh: '我有一个 ~/bin 目录，里面是我这几年攒下来的小脚本：一个命令提交并推送、一个命令把当前分支 rebase 到 main、一个命令清理本地已合并的分支。这些脚本本身不值一提，但它们让我每天少打几十次重复的命令。',
        textEn: 'I have a ~/bin directory with small scripts accumulated over the years: one command to commit and push, one to rebase the current branch onto main, one to clean up merged local branches. The scripts themselves are unremarkable, but they save me dozens of repetitive commands every day.',
      },
      {
        type: 'code',
        lang: 'bash',
        textZh: `# 一键提交并推送
g() {
  git add -A && git commit -m "$1" && git push
}`,
        textEn: `# One-shot commit and push
g() {
  git add -A && git commit -m "$1" && git push
}`,
      },
      {
        type: 'quote',
        textZh: '工具的意义不是让你更快，而是让你把注意力留给真正重要的事。',
        textEn: 'The point of tools is not to make you faster, but to free your attention for what actually matters.',
      },
      {
        type: 'h2',
        textZh: '部署：越来越无聊，越来越好',
        textEn: 'Deploy: increasingly boring, increasingly good',
      },
      {
        type: 'p',
        textZh: '我记着第一次部署一个应用要配 Nginx、申请 SSL、写 systemd 单元的那个下午。现在一个 git push 就完了。无聊吗？无聊。但无聊说明它不再是你要操心的事了，你可以去操心真正的问题。',
        textEn: 'I remember the afternoon of my first deploy — configuring Nginx, requesting SSL, writing a systemd unit. Now it is one git push. Boring? Yes. But boring means it is no longer your problem, and you can go worry about real problems.',
      },
    ],
  },
  {
    id: 6,
    slug: 'designers-frontend-basics',
    titleZh: '写给设计师的前端基础',
    excerptZh: 'CSS 变量、backdrop-filter、布局系统——设计师值得了解的前端三件套。',
    excerptEn: 'CSS vars, backdrop-filter, layout — the three frontend things designers should know.',
    titleEn: 'Frontend Basics for Designers',
    date: '2026-03-10',
    readMin: 9,
    catZh: '图展',
    catEn: 'Gallery',
    catKey: 'gallery',
    tags: ['css', 'figma', 'design'],
    cover: img('A split screen showing a Figma design file on the left and the same design rendered as a website on the right, bridge between design and code, modern clean workspace'),
    author: 'Lin',
    authorAvatar: img('A minimalist avatar icon, abstract geometric face, indigo and purple gradient, flat design', 'square'),
    blocks: [
      {
        type: 'p',
        textZh: '越来越多设计师开始自己写前端。这篇文章不是教程，是三件我认为最值得设计师花时间搞懂的基础——它们能解释"为什么我的设计到了代码里就变样了"。',
        textEn: 'More and more designers are writing frontend themselves. This is not a tutorial, but three foundations I think are worth a designer\'s time — they explain "why my design looks different once it becomes code".',
      },
      {
        type: 'h2',
        textZh: 'CSS 变量 = 设计 token',
        textEn: 'CSS variables = design tokens',
      },
      {
        type: 'p',
        textZh: '你在 Figma 里定义的颜色、间距、字号，到了代码里就是 CSS 变量。变量不是给开发者装酷的，是让你的设计系统能被一处修改、处处生效的机制。理解了变量，你就理解了为什么开发同学总让你"给个变量名"。',
        textEn: 'The colors, spacing, font sizes you define in Figma become CSS variables in code. Variables are not for developers to look cool — they are the mechanism that lets your design system be changed in one place and take effect everywhere. Once you understand variables, you understand why developers always ask you "for a variable name".',
      },
      {
        type: 'code',
        lang: 'css',
        textZh: `:root {
  --color-accent: #6366f1;
  --space-4: 16px;
  --radius-lg: 18px;
}`,
        textEn: `:root {
  --color-accent: #6366f1;
  --space-4: 16px;
  --radius-lg: 18px;
}`,
      },
      {
        type: 'h2',
        textZh: 'backdrop-filter：玻璃的魔法',
        textEn: 'backdrop-filter: the glass magic',
      },
      {
        type: 'p',
        textZh: '你画的那些半透明卡片，在 CSS 里靠的是 background + backdrop-filter。背景给玻璃一层底色，backdrop-filter 给玻璃一层模糊。两者缺一，要么像塑料，要么像雾。',
        textEn: 'Those semi-transparent cards you draw rely on background + backdrop-filter in CSS. The background gives the glass a base color; backdrop-filter gives it a layer of blur. Missing either, it looks like plastic or like fog.',
      },
      {
        type: 'img',
        img: img('A diagram showing a glassmorphism card broken down into layers: a colorful background, a translucent white layer, and a blur filter applied, technical illustration, clean'),
        captionZh: '玻璃效果的三个层：背景、底色、模糊。',
        captionEn: 'The three layers of glass: background, base color, blur.',
      },
      {
        type: 'h2',
        textZh: '布局：flex 与 grid',
        textEn: 'Layout: flex and grid',
      },
      {
        type: 'p',
        textZh: '设计师画的"一行三个卡片等宽排列"，到了代码里就是 display: flex。画的"网格 12 列"就是 grid。flex 解决一维方向的排列（横着或竖着），grid 解决二维方向的排列（既分行又分列）。记住这个区分，你就能读懂开发同学写的布局代码。',
        textEn: 'The "three equal-width cards in a row" you draw becomes display: flex in code. The "12-column grid" becomes grid. Flex handles one-dimensional arrangement (horizontal or vertical); grid handles two-dimensional (both rows and columns). Remember this distinction and you can read the layout code developers write.',
      },
      {
        type: 'quote',
        textZh: '设计师懂一点前端，不是为了替开发写代码，是为了让自己的设计不被代码曲解。',
        textEn: 'A designer learning a little frontend is not to write code for developers, but to stop code from misreading the design.',
      },
    ],
  },
];

// ===== 作者发布的文章（localStorage 持久化） =====
const PUBLISHED_KEY = 'blog-published-articles';

export function loadPublishedArticles(): Article[] {
  try {
    const raw = localStorage.getItem(PUBLISHED_KEY);
    return raw ? (JSON.parse(raw) as Article[]) : [];
  } catch {
    return [];
  }
}

export function savePublishedArticle(article: Article) {
  const list = loadPublishedArticles();
  const idx = list.findIndex((a) => a.id === article.id);
  if (idx >= 0) list[idx] = article;
  else list.unshift(article);
  localStorage.setItem(PUBLISHED_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('articles-updated'));
}

export function removePublishedArticle(id: number) {
  const list = loadPublishedArticles().filter((a) => a.id !== id);
  localStorage.setItem(PUBLISHED_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('articles-updated'));
}

/** 合并硬编码文章与作者发布的文章（发布的在前，按 id 去重） */
export function getAllArticles(): Article[] {
  const published = loadPublishedArticles();
  const publishedIds = new Set(published.map((a) => a.id));
  const filteredHardcoded = ARTICLES.filter((a) => !publishedIds.has(a.id));
  return [...published, ...filteredHardcoded];
}

import { useEffect, useState } from 'react';

/** 响应式文章列表：发布/删除文章后自动刷新 */
export function useArticles(): Article[] {
  const [articles, setArticles] = useState<Article[]>(() => getAllArticles());
  useEffect(() => {
    const refresh = () => setArticles(getAllArticles());
    window.addEventListener('articles-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('articles-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return articles;
}

/** 把纯文本正文解析为 Block 列表（支持轻量 markdown 语法） */
export function parseContentToBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // 跳过空行
    if (!line.trim()) {
      i++;
      continue;
    }
    // 代码块 ```
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // 跳过结束 ```
      blocks.push({ type: 'code', lang, textZh: codeLines.join('\n'), textEn: codeLines.join('\n') });
      continue;
    }
    // 列表 - 连续的 - 开头行
    if (line.trim().startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: 'list', itemsZh: items, itemsEn: items });
      continue;
    }
    // 标题
    if (line.startsWith('# ')) {
      const t = line.slice(2).trim();
      blocks.push({ type: 'h2', textZh: t, textEn: t });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      const t = line.slice(3).trim();
      blocks.push({ type: 'h3', textZh: t, textEn: t });
      i++;
      continue;
    }
    // 引用
    if (line.startsWith('> ')) {
      const t = line.slice(2).trim();
      blocks.push({ type: 'quote', textZh: t, textEn: t });
      i++;
      continue;
    }
    // 段落：合并连续非空行
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('```') && !lines[i].trim().startsWith('- ') && !lines[i].startsWith('# ') && !lines[i].startsWith('## ') && !lines[i].startsWith('> ')) {
      paraLines.push(lines[i]);
      i++;
    }
    const para = paraLines.join(' ').trim();
    if (para) blocks.push({ type: 'p', textZh: para, textEn: para });
  }
  return blocks;
}

/** 生成 slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || `article-${Date.now()}`;
}
