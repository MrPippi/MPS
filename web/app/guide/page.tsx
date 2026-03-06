import type { Metadata } from 'next';
import Link from 'next/link';
import { GITHUB_REPO_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: '使用方法 — MPS Minecraft Plugin Studio',
  description: '了解如何安裝並使用 MPS Cursor Agent Skills，快速在 Cursor IDE 中生成高品質的 Spigot / Paper 插件程式碼。',
};

const STEPS = [
  {
    number: '01',
    title: '安裝 Skills 到 Cursor',
    description:
      '將 MPS 專案的 .cursor/skills/ 目錄複製到你的插件專案根目錄，或在 Cursor 設定中將 MPS 的 skills-registry.yml 加入 Agent Skills 來源路徑。',
    code: 'git clone https://github.com/MrPippi/MPS.git\ncp -r MPS/.cursor/skills .cursor/skills',
    note: '也可以直接 Fork 本專案，以 .cursor/skills/ 作為你插件專案的子目錄。',
    links: [
      { label: '查看 GitHub 專案', href: GITHUB_REPO_URL },
      { label: '瀏覽所有 Skills', href: '/skills' },
    ],
  },
  {
    number: '02',
    title: '在 Cursor Chat 觸發 Skill',
    description:
      '開啟 Cursor 的 AI Chat（Ctrl+L / ⌘L），直接用自然語言輸入觸發關鍵字，Agent 會自動選擇對應的 Skill 並開始生成。',
    triggers: [
      { keyword: '「幫我建立指令」', skill: 'generate-command-handler' },
      { keyword: '「幫我產生 config.yml」', skill: 'generate-config-yml' },
      { keyword: '「幫我建立資料庫管理器」', skill: 'generate-database-manager' },
      { keyword: '「監聽事件」', skill: 'generate-event-listener' },
      { keyword: '「Vault 整合」', skill: 'integrate-vault' },
      { keyword: '「幫我建立 CI/CD」', skill: 'generate-cicd-workflow' },
    ],
    note: '觸發詞不需要完全相同，Cursor Agent 會理解語意並自動套用最匹配的 Skill。',
    links: [],
  },
  {
    number: '03',
    title: '取得生成結果',
    description:
      'Skill 執行後會根據你的需求自動生成 Java 類別、plugin.yml 片段、pom.xml 依賴設定等完整程式碼，可直接讓 Cursor 寫入檔案，或複製後手動貼上。',
    outputs: [
      'Java 類別（CommandExecutor、EventListener、DatabaseManager 等）',
      'plugin.yml 指令/權限宣告片段',
      'pom.xml Maven 依賴設定',
      'config.yml 設定檔與 ConfigManager',
      'GitHub Actions CI/CD workflow YAML',
    ],
    note: '生成的程式碼已包含完整的繁體中文註解與最佳實踐範例，可直接作為生產程式碼的基礎。',
    links: [],
  },
];

const FAQS = [
  {
    q: '需要什麼版本的 Cursor？',
    a: '建議使用 Cursor 0.40 以上版本，以確保 Agent Skills（.cursor/skills/ 目錄）功能正常運作。請確認 Cursor 設定中已啟用 Agent 模式。',
  },
  {
    q: 'Skills 支援哪些 Minecraft 版本？',
    a: '所有 Skills 預設以 Paper 1.20+ 為目標，生成的程式碼同時相容 Spigot 1.19+。部分 Skill（如 generate-database-manager）使用 HikariCP，需在 pom.xml 加入對應依賴，生成結果已自動包含。',
  },
  {
    q: 'Skills 會直接修改我的程式碼嗎？',
    a: '預設情況下，Cursor Agent 在執行 Skill 後會提出修改建議，你可以選擇接受（Apply）或拒絕（Reject）。若你希望 Agent 自動套用，可在 Cursor 設定中開啟 Auto-apply 功能。',
  },
  {
    q: '如何貢獻新的 Skill？',
    a: 'Fork 本專案後，在 .cursor/skills/ 目錄下新增一個資料夾，依照現有 SKILL.md 格式撰寫你的 Skill，並更新 skills-registry.yml，最後送出 Pull Request 即可。詳細說明請參考 GitHub 上的貢獻指南。',
  },
  {
    q: '可以在非 Minecraft 項目中使用這些 Skills 嗎？',
    a: '這套 Skills 專門針對 Bukkit/Spigot/Paper Minecraft 插件開發設計，部分 Skills（如 generate-database-manager、generate-cicd-workflow）的概念可通用，但生成的程式碼結構仍以 Maven + Java 插件專案為前提。',
  },
  {
    q: '生成的程式碼需要手動調整嗎？',
    a: 'Skills 生成的程式碼為高品質骨架，通常只需根據你的具體需求填入業務邏輯（如資料庫欄位名稱、指令參數數量等）。細節說明已包含在生成的程式碼註解中。',
  },
];

export default function GuidePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#21262d]">
        <div className="absolute inset-0 grid-pattern" />
        <div
          className="hero-glow absolute -top-40 -right-40 h-80 w-80 opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(63,185,80,0.4) 0%, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#3fb950]/20 bg-[#3fb950]/5 px-3 py-1 text-xs text-[#3fb950]">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              使用方法 · 快速上手教學
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#e6edf3] sm:text-5xl leading-tight">
              三步驟開始使用
              <br />
              <span className="gradient-text">MPS Skills</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#8b949e] max-w-lg">
              透過 Cursor Agent Skills，只需輸入一句自然語言，即可自動生成完整的 Spigot / Paper 插件程式碼。
              以下教學將引導你完成安裝、觸發與使用流程。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 rounded-md bg-[#3fb950] px-4 py-2 text-sm font-semibold text-[#0d1117] transition-all hover:bg-[#56d364] hover:shadow-lg hover:shadow-[#3fb950]/20"
              >
                瀏覽所有 Skills
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-4 py-2 text-sm font-semibold text-[#c9d1d9] transition-all hover:border-[#8b949e] hover:bg-[#30363d]"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3fb950] mb-2">快速上手</p>
          <h2 className="text-2xl font-bold text-[#e6edf3]">安裝與使用步驟</h2>
        </div>

        <div className="space-y-6">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              className="relative rounded-xl border border-[#21262d] bg-[#161b22] overflow-hidden"
            >
              {/* Step number accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3fb950]/40" />

              <div className="pl-6 pr-6 py-8 sm:pr-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  {/* Number badge */}
                  <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border border-[#3fb950]/30 bg-[#3fb950]/8 text-sm font-bold font-mono text-[#3fb950]">
                    {step.number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[#e6edf3] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#8b949e] leading-relaxed mb-5">{step.description}</p>

                    {/* Code block */}
                    {'code' in step && step.code && (
                      <div className="mb-5 rounded-lg border border-[#30363d] bg-[#0d1117] overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-[#21262d] px-4 py-2.5">
                          <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-[#f85149]/50" />
                            <div className="h-2.5 w-2.5 rounded-full bg-[#e3b341]/50" />
                            <div className="h-2.5 w-2.5 rounded-full bg-[#3fb950]/50" />
                          </div>
                          <span className="text-xs text-[#484f58] font-mono ml-1">Terminal</span>
                        </div>
                        <pre className="px-4 py-4 text-xs leading-relaxed text-[#79c0ff] font-mono overflow-x-auto">
                          <code>{step.code}</code>
                        </pre>
                      </div>
                    )}

                    {/* Triggers */}
                    {'triggers' in step && step.triggers && (
                      <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {step.triggers.map((t) => (
                          <div
                            key={t.skill}
                            className="flex items-center gap-3 rounded-lg border border-[#21262d] bg-[#0d1117] px-3.5 py-2.5"
                          >
                            <svg className="h-3.5 w-3.5 text-[#3fb950] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                            </svg>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-[#c9d1d9]">{t.keyword}</div>
                              <div className="text-[10px] text-[#484f58] font-mono mt-0.5 truncate">{t.skill}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Outputs */}
                    {'outputs' in step && step.outputs && (
                      <ul className="mb-5 space-y-2">
                        {step.outputs.map((o) => (
                          <li key={o} className="flex items-start gap-2.5 text-sm text-[#8b949e]">
                            <svg className="h-4 w-4 text-[#3fb950] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {o}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Note */}
                    {step.note && (
                      <div className="flex items-start gap-2.5 rounded-lg border border-[#3fb950]/15 bg-[#3fb950]/5 px-3.5 py-3">
                        <svg className="h-4 w-4 text-[#3fb950] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-[#8b949e] leading-relaxed">{step.note}</p>
                      </div>
                    )}

                    {/* Links */}
                    {step.links.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {step.links.map((link) =>
                          link.href.startsWith('http') ? (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs text-[#8b949e] transition-all hover:border-[#484f58] hover:text-[#e6edf3]"
                            >
                              {link.label}
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs text-[#8b949e] transition-all hover:border-[#484f58] hover:text-[#e6edf3]"
                            >
                              {link.label}
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Connector line to next step */}
              {idx < STEPS.length - 1 && (
                <div className="absolute -bottom-3 left-[2.875rem] h-6 w-px bg-[#21262d]" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#21262d] bg-[#0d1117]/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#3fb950] mb-2">FAQ</p>
            <h2 className="text-2xl font-bold text-[#e6edf3]">常見問題</h2>
            <p className="text-sm text-[#484f58] mt-1">找不到答案？歡迎到 GitHub 開 Issue 詢問。</p>
          </div>

          <div className="max-w-3xl space-y-2">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-lg border border-[#21262d] bg-[#161b22] overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-[#c9d1d9] hover:text-[#e6edf3] transition-colors list-none [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <svg
                    className="h-4 w-4 shrink-0 text-[#484f58] transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="border-t border-[#21262d] px-5 py-4">
                  <p className="text-sm text-[#8b949e] leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl border border-[#3fb950]/20 bg-[#0d1117] p-10">
          <div
            className="hero-glow absolute -top-20 -right-20 h-40 w-40 opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(63,185,80,0.5) 0%, transparent 70%)' }}
          />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-[#e6edf3] mb-2">準備好開始了嗎？</h2>
              <p className="text-sm text-[#8b949e] max-w-md">
                立即瀏覽所有可用的 Skills，找到最適合你當前開發需求的工具。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 rounded-md bg-[#3fb950] px-5 py-2.5 text-sm font-semibold text-[#0d1117] transition-all hover:bg-[#56d364] hover:shadow-lg hover:shadow-[#3fb950]/20"
              >
                瀏覽所有 Skills
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href={`${GITHUB_REPO_URL}#貢獻指南`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-5 py-2.5 text-sm font-semibold text-[#c9d1d9] transition-all hover:border-[#8b949e] hover:bg-[#30363d]"
              >
                貢獻指南
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
