import { useEffect, useState } from 'react';
import { Camera, Smartphone, Monitor, Code2, Palette, Cpu, Brain, Shield, Zap, Globe, Rocket, Wrench, Database, Sparkles, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface TechItem {
  name: string;
  level: number;
  year: string;
  slug: string;
  tags: string[];
  source: string;
  contentZh: string;
  contentEn: string;
}

export interface TechGroup {
  key?: string;
  zh: string;
  en: string;
  icon: typeof Camera;
  items: TechItem[];
}

export const TECH_GROUPS: TechGroup[] = [
  {
    zh: '摄影',
    en: 'Photography',
    icon: Camera,
    items: [
      { name: 'Lightroom', level: 82, year: '2018', slug: 'lightroom', tags: ['修图', 'RAW', '调色'], source: 'Adobe', contentZh: 'Lightroom 是我处理 RAW 文件的主力工具。从导入、筛选到调色、导出，整个工作流已经非常熟练。偏好使用自定义预设配合手动微调，尤其在人像和风光摄影中。', contentEn: 'Lightroom is my go-to tool for RAW processing. From import, culling to grading and export, the workflow is well-practiced. I prefer custom presets with manual tweaks, especially for portrait and landscape photography.' },
      { name: 'Photoshop', level: 75, year: '2017', slug: 'photoshop', tags: ['合成', '精修', '图层'], source: 'Adobe', contentZh: 'Photoshop 用于需要精细控制的场景——合成、局部修饰、文字排版。虽然 Lightroom 能覆盖大部分需求，但复杂项目仍然离不开 PS。', contentEn: 'Photoshop is for scenarios requiring fine control — compositing, local retouching, typography. While Lightroom covers most needs, complex projects still rely on PS.' },
    ],
  },
  {
    zh: '手机',
    en: 'Mobile',
    icon: Smartphone,
    items: [
      { name: 'iOS', level: 72, year: '2019', slug: 'ios', tags: ['Swift', 'UIKit', 'App Store'], source: 'Apple', contentZh: 'iOS 开发体验流畅，Swift 语言设计优雅。主要用 SwiftUI 做原型，UIKit 处理复杂交互。App Store 审核严格但生态成熟。', contentEn: 'iOS development is smooth, Swift is elegantly designed. I use SwiftUI for prototyping and UIKit for complex interactions. App Store review is strict but the ecosystem is mature.' },
      { name: 'Android', level: 65, year: '2020', slug: 'android', tags: ['Kotlin', 'Jetpack', 'Gradle'], source: 'Google', contentZh: 'Android 开发用 Kotlin + Jetpack Compose。碎片化是主要挑战，但 Google 的工具链近年来改善很多。', contentEn: 'Android development with Kotlin + Jetpack Compose. Fragmentation is the main challenge, but Google\'s toolchain has improved significantly in recent years.' },
    ],
  },
  {
    zh: '电脑',
    en: 'Computer',
    icon: Monitor,
    items: [
      { name: 'macOS', level: 88, year: '2016', slug: 'macos', tags: ['Unix', 'Homebrew', '终端'], source: 'Apple', contentZh: 'macOS 是开发者的首选系统。Unix 基础、优秀的终端体验、Homebrew 包管理，加上稳定的系统更新，让日常开发非常高效。', contentEn: 'macOS is the developer\'s首选 system. Unix foundation, excellent terminal, Homebrew package management, plus stable updates make daily development very efficient.' },
      { name: 'Windows', level: 80, year: '2015', slug: 'windows', tags: ['WSL', 'PowerShell', '游戏'], source: 'Microsoft', contentZh: 'Windows 11 + WSL2 让开发体验大幅提升。PowerShell 功能强大，游戏生态无可替代。双系统切换已成为日常工作流。', contentEn: 'Windows 11 + WSL2 greatly improved the development experience. PowerShell is powerful, gaming ecosystem is irreplaceable. Dual-system switching has become part of the daily workflow.' },
      { name: 'Linux', level: 72, year: '2018', slug: 'linux', tags: ['Ubuntu', 'Arch', '服务器'], source: 'Open Source', contentZh: 'Linux 主要用于服务器部署和开发环境。熟悉 Ubuntu 和 Arch，能用 systemd、docker 管理服务和容器。', contentEn: 'Linux is mainly used for server deployment and development environments. Familiar with Ubuntu and Arch, can manage services and containers with systemd and docker.' },
    ],
  },
  {
    zh: '代码',
    en: 'Code',
    icon: Code2,
    items: [
      { name: 'TypeScript', level: 92, year: '2020', slug: 'typescript', tags: ['类型安全', '泛型', '装饰器'], source: 'Microsoft', contentZh: 'TypeScript 是本项目的主力语言。类型系统让重构更安全，泛型和条件类型能表达复杂的业务逻辑。配合 ESLint 和 Prettier 保持代码质量。', contentEn: 'TypeScript is the main language of this project. The type system makes refactoring safer, generics and conditional types can express complex business logic. Combined with ESLint and Prettier to maintain code quality.' },
      { name: 'JavaScript', level: 95, year: '2016', slug: 'javascript', tags: ['ES6+', '异步', '原型链'], source: 'ECMA', contentZh: 'JavaScript 是 Web 开发的基石。从 ES6 到最新提案，语言特性不断丰富。深入理解闭包、原型链、事件循环是进阶的关键。', contentEn: 'JavaScript is the cornerstone of web development. From ES6 to the latest proposals, language features continue to enrich. Deep understanding of closures, prototype chains, and event loops is key to advancement.' },
      { name: 'Python', level: 78, year: '2018', slug: 'python', tags: ['脚本', '数据', 'AI'], source: 'Python.org', contentZh: 'Python 用于脚本自动化、数据处理和 AI 实验。语法简洁，库生态丰富。Django 和 FastAPI 是常用的 Web 框架。', contentEn: 'Python is used for scripting, data processing, and AI experiments. Clean syntax, rich library ecosystem. Django and FastAPI are commonly used web frameworks.' },
      { name: 'Go', level: 65, year: '2022', slug: 'go', tags: ['并发', '微服务', '编译'], source: 'Google', contentZh: 'Go 的并发模型和编译速度令人印象深刻。用于构建高性能后端服务和 CLI 工具。goroutine 和 channel 是核心抽象。', contentEn: 'Go\'s concurrency model and compilation speed are impressive. Used for building high-performance backend services and CLI tools. Goroutines and channels are the core abstractions.' },
      { name: 'Rust', level: 40, year: '2024', slug: 'rust', tags: ['所有权', '安全', '系统'], source: 'Mozilla', contentZh: 'Rust 的所有权系统和零成本抽象很有吸引力。学习曲线陡峭，但一旦掌握，能写出既安全又高效的代码。目前还在入门阶段。', contentEn: 'Rust\'s ownership system and zero-cost abstractions are attractive. Steep learning curve, but once mastered, you can write code that is both safe and efficient. Still in the beginner stage.' },
      { name: 'Node.js', level: 88, year: '2018', slug: 'nodejs', tags: ['运行时', 'npm', '异步IO'], source: 'OpenJS', contentZh: 'Node.js 是前后端统一的桥梁。npm 生态庞大，Express 和 Koa 是常用的框架。Event Loop 机制需要深入理解才能写出高性能代码。', contentEn: 'Node.js is the bridge for frontend-backend unification. npm ecosystem is huge, Express and Koa are commonly used frameworks. The Event Loop mechanism needs deep understanding to write high-performance code.' },
      { name: 'PostgreSQL', level: 72, year: '2020', slug: 'postgresql', tags: ['关系型', 'JSON', '扩展'], source: 'PostgreSQL', contentZh: 'PostgreSQL 是功能最强大的开源关系数据库。支持 JSON/JSONB、全文搜索、地理信息扩展。复杂查询和事务处理表现优秀。', contentEn: 'PostgreSQL is the most powerful open-source relational database. Supports JSON/JSONB, full-text search, geospatial extensions. Excellent performance for complex queries and transaction processing.' },
      { name: 'Redis', level: 68, year: '2021', slug: 'redis', tags: ['缓存', '消息队列', '内存'], source: 'Redis.io', contentZh: 'Redis 用于缓存、会话存储和消息队列。内存数据结构服务器，性能极高。常用数据结构包括 String、Hash、List、Set、ZSet。', contentEn: 'Redis is used for caching, session storage, and message queues. In-memory data structure server with extremely high performance. Common data structures include String, Hash, List, Set, ZSet.' },
      { name: 'GraphQL', level: 70, year: '2021', slug: 'graphql', tags: ['查询', 'Schema', 'Apollo'], source: 'Meta', contentZh: 'GraphQL 让客户端精确控制数据获取。Schema 定义清晰，类型安全。Apollo Client 是常用的实现方案。', contentEn: 'GraphQL lets clients precisely control data fetching. Schema definition is clear, type-safe. Apollo Client is a commonly used implementation.' },
      { name: 'Git', level: 90, year: '2017', slug: 'git', tags: ['版本控制', '分支', '协作'], source: 'Linux Foundation', contentZh: 'Git 是版本控制的标准工具。熟悉 rebase、cherry-pick、bisect 等高级操作。Git Flow 和 GitHub Flow 是常用的分支策略。', contentEn: 'Git is the standard version control tool. Familiar with advanced operations like rebase, cherry-pick, bisect. Git Flow and GitHub Flow are commonly used branching strategies.' },
      { name: 'Docker', level: 75, year: '2020', slug: 'docker', tags: ['容器', '镜像', '编排'], source: 'Docker Inc', contentZh: 'Docker 让应用部署标准化。Dockerfile 定义环境，docker-compose 管理多容器应用。Kubernetes 是更复杂的编排方案。', contentEn: 'Docker standardizes application deployment. Dockerfile defines the environment, docker-compose manages multi-container applications. Kubernetes is a more complex orchestration solution.' },
      { name: 'Vite', level: 90, year: '2022', slug: 'vite', tags: ['构建', 'HMR', 'ESBuild'], source: 'Evan You', contentZh: 'Vite 是本项目使用的构建工具。基于 ESBuild 的预构建和原生 ESM 的热更新，开发体验极佳。插件生态也在快速成长。', contentEn: 'Vite is the build tool used in this project. Pre-bundling based on ESBuild and native ESM hot updates provide an excellent development experience. The plugin ecosystem is also growing rapidly.' },
    ],
  },
  {
    zh: '设计',
    en: 'Design',
    icon: Palette,
    items: [
      { name: 'React', level: 94, year: '2019', slug: 'react', tags: ['组件', 'Hooks', '虚拟DOM'], source: 'Meta', contentZh: 'React 是前端开发的核心框架。组件化思维、Hooks API、虚拟 DOM diff 算法是核心概念。配合 TypeScript 使用体验更佳。', contentEn: 'React is the core framework for frontend development. Component thinking, Hooks API, virtual DOM diff algorithm are core concepts. Better experience when combined with TypeScript.' },
      { name: 'Next.js', level: 85, year: '2021', slug: 'nextjs', tags: ['SSR', '路由', '全栈'], source: 'Vercel', contentZh: 'Next.js 提供了完整的 React 应用框架。SSR/SSG、文件系统路由、API Routes 让全栈开发变得简单。App Router 是最新的架构。', contentEn: 'Next.js provides a complete React application framework. SSR/SSG, file-system routing, API Routes make full-stack development simple. App Router is the latest architecture.' },
      { name: 'Vue', level: 70, year: '2020', slug: 'vue', tags: ['响应式', '模板', '组合式'], source: 'Evan You', contentZh: 'Vue 的模板语法直观，响应式系统优雅。Composition API 让逻辑复用更灵活。Nuxt 是 Vue 的全栈框架。', contentEn: 'Vue\'s template syntax is intuitive, reactivity system is elegant. Composition API makes logic reuse more flexible. Nuxt is Vue\'s full-stack framework.' },
      { name: 'CSS / Glass', level: 90, year: '2017', slug: 'css-glass', tags: ['backdrop-filter', '变量', '动画'], source: 'W3C', contentZh: 'CSS 是本项目视觉风格的核心。backdrop-filter 实现玻璃拟态，CSS 变量管理主题，关键帧动画增强交互反馈。', contentEn: 'CSS is the core of this project\'s visual style. backdrop-filter implements glassmorphism, CSS variables manage themes, keyframe animations enhance interaction feedback.' },
      { name: 'Framer Motion', level: 88, year: '2022', slug: 'framer-motion', tags: ['动画', '手势', '布局'], source: 'Framer', contentZh: 'Framer Motion 是 React 的动画库。声明式 API、手势识别、布局动画让复杂交互变得简单。本项目大量使用。', contentEn: 'Framer Motion is React\'s animation library. Declarative API, gesture recognition, layout animations make complex interactions simple. Heavily used in this project.' },
      { name: 'Figma', level: 80, year: '2021', slug: 'figma', tags: ['原型', '组件', '协作'], source: 'Figma', contentZh: 'Figma 是设计协作的标准工具。组件系统、自动布局、原型功能让设计到开发的流程更顺畅。', contentEn: 'Figma is the standard tool for design collaboration. Component system, auto layout, prototyping features make the design-to-development flow smoother.' },
    ],
  },
  {
    zh: '硬件',
    en: 'Hardware',
    icon: Cpu,
    items: [
      { name: 'Arduino', level: 60, year: '2021', slug: 'arduino', tags: ['微控制器', '传感器', 'C++'], source: 'Arduino', contentZh: 'Arduino 是入门嵌入式开发的理想平台。丰富的库和社区支持，适合快速原型开发。', contentEn: 'Arduino is an ideal platform for beginners in embedded development. Rich libraries and community support, suitable for rapid prototyping.' },
      { name: 'Raspberry Pi', level: 55, year: '2020', slug: 'raspberry-pi', tags: ['Linux', 'GPIO', 'IoT'], source: 'Raspberry Pi Foundation', contentZh: '树莓派是运行 Linux 的微型电脑。GPIO 接口可以连接各种传感器，适合 IoT 项目和家庭自动化。', contentEn: 'Raspberry Pi is a mini computer running Linux. GPIO interface can connect various sensors, suitable for IoT projects and home automation.' },
    ],
  },
  {
    zh: 'AI',
    en: 'AI',
    icon: Brain,
    items: [
      { name: 'TensorFlow', level: 50, year: '2023', slug: 'tensorflow', tags: ['深度学习', '图计算', '部署'], source: 'Google', contentZh: 'TensorFlow 是 Google 的深度学习框架。计算图抽象强大，但 API 复杂度较高。TensorFlow Lite 适合移动端部署。', contentEn: 'TensorFlow is Google\'s deep learning framework. Computational graph abstraction is powerful, but API complexity is high. TensorFlow Lite is suitable for mobile deployment.' },
      { name: 'PyTorch', level: 45, year: '2023', slug: 'pytorch', tags: ['动态图', '研究', 'Pythonic'], source: 'Meta', contentZh: 'PyTorch 的动态图机制更符合 Python 直觉。学术界广泛使用，Hugging Face 生态让模型复用变得简单。', contentEn: 'PyTorch\'s dynamic graph mechanism is more intuitive for Python. Widely used in academia, Hugging Face ecosystem makes model reuse simple.' },
    ],
  },
  {
    zh: '网络安全',
    en: 'Security',
    icon: Shield,
    items: [
      { name: 'Wireshark', level: 55, year: '2022', slug: 'wireshark', tags: ['抓包', '协议', '分析'], source: 'Wireshark Foundation', contentZh: 'Wireshark 是网络协议分析的标准工具。可以捕获和分析网络流量，帮助理解协议细节和排查网络问题。', contentEn: 'Wireshark is the standard tool for network protocol analysis. Can capture and analyze network traffic, helping understand protocol details and troubleshoot network issues.' },
      { name: 'Nmap', level: 50, year: '2022', slug: 'nmap', tags: ['扫描', '端口', '发现'], source: 'Nmap Project', contentZh: 'Nmap 是网络发现和安全审计工具。可以扫描主机、端口、服务版本，是渗透测试的基础工具。', contentEn: 'Nmap is a network discovery and security auditing tool. Can scan hosts, ports, service versions, and is a fundamental tool for penetration testing.' },
    ],
  },
];

// ===== 自定义技栈分类（内置 TECH_GROUPS 之外的用户新增分类） =====

const GROUPS_KEY = 'blog-tech-groups';
const GROUPS_EVENT = 'tech-groups-updated';

const TECH_ICON_POOL: Record<string, LucideIcon> = {
  zap: Zap,
  globe: Globe,
  rocket: Rocket,
  wrench: Wrench,
  database: Database,
  sparkles: Sparkles,
  layers: Layers,
};

interface CustomTechGroup {
  key: string;
  zh: string;
  en: string;
  icon: string;
}

function loadCustomTechGroups(): CustomTechGroup[] {
  try {
    return JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]') as CustomTechGroup[];
  } catch {
    return [];
  }
}

export function loadTechGroups(): TechGroup[] {
  const custom = loadCustomTechGroups().map((c) => ({
    key: c.key,
    zh: c.zh,
    en: c.en,
    icon: TECH_ICON_POOL[c.icon] ?? Layers,
    items: [] as TechItem[],
  }));
  return [...TECH_GROUPS, ...custom];
}

function persistCustomTechGroups(list: CustomTechGroup[]) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(GROUPS_EVENT));
}

/** 新增技栈分类，返回新分类 key；名称重复时返回 null */
export function addTechGroup(zh: string, en: string): string | null {
  const trimmed = zh.trim();
  const enTrim = en.trim() || trimmed;
  if (!trimmed) return null;
  const existing = loadTechGroups();
  if (existing.some((g) => g.zh === trimmed || g.en.toLowerCase() === enTrim.toLowerCase())) return null;
  const key = `g-${Date.now()}`;
  const pool = Object.keys(TECH_ICON_POOL);
  const icon = pool[loadCustomTechGroups().length % pool.length];
  persistCustomTechGroups([...loadCustomTechGroups(), { key, zh: trimmed, en: enTrim, icon }]);
  return key;
}

/** 删除自定义技栈分类（内置分类不可删除） */
export function removeTechGroup(key: string) {
  if (!key.startsWith('g-')) return;
  persistCustomTechGroups(loadCustomTechGroups().filter((g) => g.key !== key));
}

export function useTechGroups(): TechGroup[] {
  const [groups, setGroups] = useState<TechGroup[]>(() => loadTechGroups());
  useEffect(() => {
    const refresh = () => setGroups(loadTechGroups());
    window.addEventListener(GROUPS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(GROUPS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return groups;
}
