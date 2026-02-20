import HomeNav from "@/components/navbar"
import HomeFooter from "@/components/footer"
import { NextSeo } from "next-seo"

export default function TermsOfService() {
    return (
        <>
            <NextSeo
                title='Resume Analyzer - Terms of Service'
                description='The terms and conditions of using Resume Analyzer.'
                canonical={process.env.NEXT_PUBLIC_SITE_URL + '/terms-of-service'}
                openGraph={{
                    url: process.env.NEXT_PUBLIC_SITE_URL + '/terms-of-service',
                    title: 'Resume Analyzer - Terms of Service',
                    description: 'The terms and conditions of using Resume Analyzer.',
                    images: [
                        {
                            url: process.env.NEXT_PUBLIC_SITE_URL + '/full-logo.png',
                            width: 1024,
                            height: 1024,
                            alt: "Resume Analyzer Logo",
                            type: "image/png"
                        }
                    ],
                    siteName: "Resume Analyzer"
                }}
            />

            <HomeNav />
            <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-28">
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white/80 dark:bg-midnight/80 backdrop-blur-md shadow-sm px-6 sm:px-10 py-8">
                    <h1 className="text-4xl sm:text-5xl font-headings font-semibold tracking-tight text-center text-slate-900 dark:text-white">
                        Resume Analyzer Terms of Service
                    </h1>
                    <p className="mt-3 text-sm opacity-80 text-center font-main text-slate-700 dark:text-slate-300">
                        Last Updated: Feb 20, 2026
                    </p>

                    <div className="mt-8 space-y-7 text-base leading-relaxed font-main text-slate-800 dark:text-slate-100">
                        <p>
                            These Terms are a binding agreement between you (&quot;you,&quot; &quot;user&quot;) and RezPoint Inc. (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) for your use of Resume Analyzer (the &quot;Service&quot;).
                            By using the Service, you agree to them. If you do not agree, do not use the Service.
                        </p>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Using Resume Analyzer</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>You must be at least the age of majority in your jurisdiction (or have parent/guardian permission).</li>
                                <li>Sign-in uses your Google account; keep your credentials secure. You are responsible for activity under your account.</li>
                                <li>Provide accurate information and keep it current.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">What the Service Provides</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>AI-powered parsing and analysis of resumes against job descriptions, producing scores, highlights, and recommendations.</li>
                                <li>Outputs are automated and may be inaccurate, incomplete, or unsuitable for your specific situation. We do not guarantee employment or outcomes.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Acceptable Use</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Do not upload illegal content or content you lack rights to use.</li>
                                <li>Do not try to scrape, reverse engineer, bypass security, overload the Service, or share accounts to avoid fees.</li>
                                <li>No malware, fraud, chargeback abuse, or other harmful or unlawful activity.</li>
                            </ul>
                            <p>We may suspend or terminate access if we believe these rules were violated.</p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Your Content &amp; License to Us</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>You keep ownership of the resumes, job descriptions, and inputs you provide (&quot;User Content&quot;).</li>
                                <li>You grant Resume Analyzer and RezPoint Inc. a worldwide, transferable, sublicensable, royalty-free license to host, process, modify, analyze, and create derivatives of User Content to operate, improve, secure, and audit the Service (including fraud/chargeback prevention and analytics).</li>
                                <li>We may use aggregated or de-identified data for business purposes where feasible.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Tokens &amp; Billing (Stripe)</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Some features require tokens. Tokens have no cash value and are not transferable unless we state otherwise.</li>
                                <li>Token prices and feature costs may change; changes do not affect tokens already spent.</li>
                                <li>Stripe processes payments. You authorize charges to your selected method for tokens and taxes (if applicable).</li>
                                <li>Spent tokens are not refundable except where required by law. If you suspect unauthorized charges, contact us and your payment provider promptly.</li>
                                <li>We may suspend accounts or block transactions if we suspect fraud or abuse.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Privacy</h2>
                            <p>Your use of the Service is also governed by our Privacy Policy. If these Terms and the Privacy Policy conflict on data-handling, the Privacy Policy generally controls for that issue.</p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Retention &amp; Deletion</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>You can delete certain results in the UI. Deletion removes them from your active view.</li>
                                <li>Operational, billing, and security records (including token usage/purchases) may be retained for up to five (5) years for auditing, fraud prevention, legal, tax, and accounting purposes, or longer if legally required.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Service Changes &amp; Availability</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>We may modify, suspend, or discontinue any part of the Service at any time.</li>
                                <li>We do not guarantee uninterrupted or error-free availability; outages and maintenance may occur.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Third-Party Services</h2>
                            <p>The Service relies on Google (sign-in, Firebase storage/database), Groq (AI processing), and Stripe (payments). Their terms and privacy policies apply; we are not responsible for them.</p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Warranty Disclaimer</h2>
                            <p>The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind (express, implied, or statutory), including merchantability, fitness for a particular purpose, non-infringement, accuracy, or reliability.</p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Limitation of Liability</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, punitive, or lost-profit damages.</li>
                                <li>We are not liable for loss, theft, unauthorized access, breach, alteration, unavailability, or destruction of data, including due to third parties or events outside our control.</li>
                                <li>If liability cannot be excluded, our total liability in any 12-month period is limited to the amount you paid for tokens during that period, unless prohibited by law.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Indemnification</h2>
                            <p>You agree to defend, indemnify, and hold harmless Resume Analyzer and RezPoint Inc. from claims arising out of your use of the Service, your User Content, your violation of these Terms, or your violation of law or third-party rights.</p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Termination</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>You may stop using the Service anytime.</li>
                                <li>We may suspend or terminate access if we believe you violated these Terms or created risk/fraud. Tokens may be forfeited to the maximum extent permitted by law in cases of fraud/abuse; spent tokens remain non-refundable.</li>
                                <li>Sections that should survive termination (licenses, disclaimers, limits of liability, indemnity, governing law) will survive.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Governing Law &amp; Venue</h2>
                            <p>These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Disputes will be heard in the courts located in Ontario, Canada.</p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Changes to These Terms</h2>
                            <p>We may update these Terms from time to time. The latest version (and date) will always appear here. Continuing to use the Service after changes means you accept the updated Terms.</p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-2xl font-headings font-semibold text-slate-900 dark:text-white">Contact</h2>
                            <p>
                                Email:{' '}
                                <a className="underline underline-offset-4 text-eazy-main-100 hover:text-top-orange" href="mailto:atinderpaulk@rezpoint.xyz">
                                    atinderpaulk@rezpoint.xyz
                                </a>
                            </p>
                            <p>Operator: RezPoint Inc.</p>
                        </section>
                    </div>
                </div>
            </main>
            <HomeFooter />
        </>
    )
}
