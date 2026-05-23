'use client';

import Link from 'next/link';
import { GITHUB_REPO_URL, GITHUB_CONTRIBUTE_URL } from '@/config/site';
import { useLanguage } from '@/shared/i18n';

export function GuidePageClient() {
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-0 grid-pattern" />
        <div
          className="hero-glow absolute -top-40 -right-40 h-80 w-80 opacity-20"
          style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 40%, transparent) 0%, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-accent-faint px-3 py-1 text-xs text-[var(--color-accent)]">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {t.guide.badge}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-5xl leading-tight">
              {t.guide.heroTitle}
              <br />
              <span className="gradient-text">{t.guide.heroTitleHighlight}</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[var(--color-text-secondary)] max-w-lg">
              {t.guide.heroDescription}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)] transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-lg hover:shadow-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] focus-ring"
              >
                {t.guide.browseSkills}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-text-secondary)] hover:bg-[var(--color-border-strong)] focus-ring"
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
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-2">{t.guide.stepsLabel}</p>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">{t.guide.stepsTitle}</h2>
        </div>

        <div className="space-y-6">
          {t.guide.steps.map((step, idx) => (
            <div
              key={step.number}
              className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[color-mix(in_srgb,var(--color-accent)_40%,transparent)]" />

              <div className="pl-6 pr-6 py-8 sm:pr-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] text-sm font-bold font-mono text-[var(--color-accent)]">
                    {step.number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{step.title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">{step.description}</p>

                    {step.code && (
                      <div className="mb-5 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-2.5">
                          <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-error)_50%,transparent)]" />
                            <div className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-warning)_50%,transparent)]" />
                            <div className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_50%,transparent)]" />
                          </div>
                          <span className="text-xs text-[var(--color-text-muted)] font-mono ml-1">Terminal</span>
                        </div>
                        <pre className="px-4 py-4 text-xs leading-relaxed text-[#79c0ff] font-mono overflow-x-auto">
                          <code>{step.code}</code>
                        </pre>
                      </div>
                    )}

                    {step.triggers && (
                      <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {step.triggers.map((trigger) => (
                          <div
                            key={trigger.skill}
                            className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5"
                          >
                            <svg className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                            </svg>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-[var(--color-text-secondary)]">{trigger.keyword}</div>
                              <div className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5 truncate">{trigger.skill}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {step.outputs && (
                      <ul className="mb-5 space-y-2">
                        {step.outputs.map((output) => (
                          <li key={output} className="flex items-start gap-2.5 text-sm text-[var(--color-text-secondary)]">
                            <svg className="h-4 w-4 text-[var(--color-accent)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {output}
                          </li>
                        ))}
                      </ul>
                    )}

                    {step.note && (
                      <div className="flex items-start gap-2.5 rounded-lg border border-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] bg-accent-faint px-3.5 py-3">
                        <svg className="h-4 w-4 text-[var(--color-accent)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{step.note}</p>
                      </div>
                    )}

                    {step.links.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {step.links.map((link) =>
                          link.href.startsWith('http') ? (
                            <a
                              key={link.href}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)] focus-ring"
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
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)] focus-ring"
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

              {idx < t.guide.steps.length - 1 && (
                <div className="absolute -bottom-3 left-[2.875rem] h-6 w-px bg-[var(--color-border)]" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_60%,transparent)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-2">{t.guide.faqLabel}</p>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">{t.guide.faqTitle}</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.guide.faqSubtitle}</p>
          </div>

          <div className="max-w-3xl space-y-2">
            {t.guide.faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors list-none [&::-webkit-details-marker]:hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-inset">
                  {faq.q}
                  <svg
                    className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="border-t border-[var(--color-border)] px-5 py-4">
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl border border-accent-soft bg-[var(--color-surface)] p-10">
          <div
            className="hero-glow absolute -top-20 -right-20 h-40 w-40 opacity-40"
            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 50%, transparent) 0%, transparent 70%)' }}
          />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">{t.guide.ctaTitle}</h2>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-md">{t.guide.ctaDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-bg)] transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-lg hover:shadow-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] focus-ring"
              >
                {t.guide.ctaButtonSkills}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href={GITHUB_CONTRIBUTE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-text-secondary)] hover:bg-[var(--color-border-strong)] focus-ring"
              >
                {t.guide.ctaButtonContribute}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
