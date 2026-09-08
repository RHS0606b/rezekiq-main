import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { Icon } from './icons/Icon';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;
}

import { translations } from '../translations';

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart, onLogin, theme, toggleTheme, language, setLanguage
}) => {
  const t = translations[language || 'id'];
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setIsNavVisible(false);
    } else {
      setIsNavVisible(true);
    }
  });

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: t.problem, id: 'problem' },
    { name: t.solution, id: 'solution' },
    { name: t.demo, id: 'demo' },
    { name: t.testimonials, id: 'testimonials' },
  ];

  const socialLinks = [
    { icon: [<path key="ig1" d="M16 3H8a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V8a5 5 0 0 0-5-5z" />, <path key="ig2" d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />, <line key="ig3" x1="17.5" y1="6.5" x2="17.51" y2="6.5" />], url: 'https://www.instagram.com/contech.id/' },
    { icon: [<path key="th1" d="M12 12c-2.5 0-4.5-2-4.5-4.5S9.5 3 12 3s4.5 2 4.5 4.5v3a2.5 2.5 0 0 1-5 0V9" />, <path key="th2" d="M8 11.5c-2 1.5-3 3.5-3 5.5s1 4 3 5 5 1 7-1 3-3.5 3-5.5-1-4-3-5.5" />], url: 'https://www.threads.com/@contech.id?hl=id' },
    { icon: [<path key="x1" d="M4 4l11.733 16h4.267l-11.733 -16z" />, <path key="x2" d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />], url: 'https://x.com/contechofficial' },
    { icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />, url: 'https://web.facebook.com/contech.id.' },
    { icon: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />, url: 'https://www.tiktok.com/@contech.id' },
    { icon: [<path key="yt1" d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z" />, <polygon key="yt2" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />], url: 'https://www.youtube.com/@contechid1288' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500 overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900 scroll-smooth">
      {/* Scroll-hide Nav */}
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isNavVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-[100] p-4 md:p-6"
      >
        <div className="max-w-7xl mx-auto px-6 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none"
            />
            <span className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter hidden sm:block">Rezeki<span className="text-emerald-500">Q</span></span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-emerald-600 transition-colors"
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-500 font-black text-[10px] shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 hover:border-emerald-500 transition-all"
            >
              <Icon size={14}><path d="m5 8 6 6 6-6" /></Icon>
              <span>{language.toUpperCase()}</span>
              <Icon size={14}><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><circle cx="12" cy="12" r="10" /></Icon>
            </button>
            <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-emerald-500 transition-colors hidden sm:block">
              <Icon size={20}>
                {theme === 'light' ? <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /> : [
                  <circle key="c1" cx="12" cy="12" r="4" />,
                  <path key="p1" d="M12 2v2" />,
                  <path key="p2" d="M12 20v2" />,
                  <path key="p3" d="m4.93 4.93 1.41 1.41" />,
                  <path key="p4" d="m17.66 17.66 1.41 1.41" />,
                  <path key="p5" d="M2 12h2" />,
                  <path key="p6" d="M20 12h2" />,
                  <path key="p7" d="m6.34 17.66-1.41 1.41" />,
                  <path key="p8" d="m19.07 4.93-1.41 1.41" />
                ]}
              </Icon>
            </button>
            <button
              onClick={onLogin}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hidden md:block"
            >
              {t.login}
            </button>
            <button
              onClick={onStart}
              className="px-5 py-3 sm:px-6 sm:py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 dark:shadow-none hover:scale-105 transition-all active:scale-95"
            >
              {t.start}
            </button>

            {/* Burger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-900 dark:text-white"
            >
              <Icon size={24}>
                {isMobileMenuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </Icon>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[90] bg-white dark:bg-gray-950 p-8 pt-32"
          >
            <div className="flex flex-col gap-8 items-center text-center">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-4xl font-black uppercase tracking-tighter text-gray-900 dark:text-white hover:text-emerald-600 transition-colors"
                >
                  {link.name}
                </button>
              ))}
              <div className="flex gap-6 mt-8">
                <button
                  onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                  className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest"
                >
                  {language.toUpperCase()}
                </button>
                <button onClick={toggleTheme} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white flex items-center justify-center">
                  <Icon size={24}>{theme === 'light' ? <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /> : <circle cx="12" cy="12" r="10" />}</Icon>
                </button>
              </div>
              <button
                onClick={onLogin}
                className="w-full py-5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em]"
              >
                {t.loginBtn}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative pt-40 pb-20 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t.landingHeroSmall}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-[0.85] mb-8"
        >
          {t.landingHeroTitle1}<br />
          <span className="text-emerald-600">{t.landingHeroTitle2}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-12"
        >
          {t.landingHeroDesc}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <button onClick={onStart} className="px-12 py-6 bg-emerald-600 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 dark:shadow-none hover:scale-105 transition-all">
            {t.landingStartBtn}
          </button>
          <button onClick={onLogin} className="px-12 py-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            {t.landingLoginBtn}
          </button>
        </motion.div>
      </section>

      {/* Problem Section (Red Style) */}
      <section id="problem" className="py-32 px-8 bg-rose-50 dark:bg-rose-950/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-900 mb-6">
              <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">{t.problemLabel}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-[0.9] mb-8">
              {t.problemTitle1} <span className="text-rose-600">{t.problemTitle2}</span> & <span className="text-rose-600">{t.problemTitle3}</span> {t.problemTitle4}?
            </h2>
            <div className="space-y-6">
              {[
                { t: t.problem1Title, d: t.problem1Desc },
                { t: t.problem2Title, d: t.problem2Desc },
                { t: t.problem3Title, d: t.problem3Desc }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 shrink-0 mt-1">
                    <Icon size={14}><path d="M18 6 6 18M6 6l12 12" /></Icon>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white uppercase text-sm mb-1">{item.t}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group">
            <div className="aspect-square bg-rose-200 dark:bg-rose-900/20 rounded-[64px] overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-700 flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center text-rose-500 text-9xl italic font-black opacity-20">?!</div>
              {/* Visual representation of problem */}
              <div className="w-32 h-32 bg-rose-500 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="absolute -bottom-10 -left-10 p-8 bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 animate-bounce-slow">
              <p className="text-rose-600 font-black text-2xl">93%</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.problemBadStat}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section (Green Style) */}
      <section id="solution" className="py-32 px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 mb-6">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t.solutionLabel}</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white uppercase tracking-tighter text-center leading-[0.9] mb-16">
            {t.solutionTitle1} <span className="text-emerald-600 italic">Ecosystem</span><br />{t.solutionTitle2}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {[
              { i: '📔', t: t.solution1Title, d: t.solution1Desc },
              { i: '🤖', t: t.solution2Title, d: t.solution2Desc },
              { i: '🏆', t: t.solution3Title, d: t.solution3Desc },
              { i: '📊', t: t.solution4Title, d: t.solution4Desc }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[40px] border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center"
              >
                <div className="text-4xl mb-6">{item.i}</div>
                <h4 className="font-black text-gray-900 dark:text-white uppercase text-lg mb-2 tracking-tighter">{item.t}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="demo" className="py-32 px-8 bg-gray-50 dark:bg-gray-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 italic">{t.demoTitle}</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">{t.demoDesc}</p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="aspect-video bg-emerald-900 rounded-[48px] overflow-hidden shadow-2xl relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/40 to-black/60 flex items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Icon size={32} fill="currentColor" className="text-emerald-600 ml-1"><path d="m7 3 14 9-14 9V3z" /></Icon>
              </div>
            </div>
            {/* Overlay Text */}
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
              <p className="text-white font-black uppercase text-xs tracking-widest">{t.landingProductTour}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section (4 cards) */}
      <section id="testimonials" className="py-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase tracking-tighter text-center mb-20 leading-none">{t.testimonialTitle1}<br /><span className="text-emerald-600">{t.testimonialTitle2}</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { n: t.testi1Name, r: t.testi1Role, c: t.testi1Comment },
              { n: t.testi2Name, r: t.testi2Role, c: t.testi2Comment },
              { n: t.testi3Name, r: t.testi3Role, c: t.testi3Comment },
              { n: t.testi4Name, r: t.testi4Role, c: t.testi4Comment }
            ].map((testi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-10 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-2xl">👤</div>
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">{testi.n}</h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{testi.r}</p>
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-300 italic leading-relaxed font-medium">"{testi.c}"</p>
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => <Icon key={i} size={14} fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></Icon>)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto bg-emerald-600 rounded-[64px] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-200 dark:shadow-none">
          <div className="relative z-10">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-8 italic">{t.ctaTitle}</h2>
            <p className="max-w-2xl mx-auto text-emerald-50 text-xl font-medium mb-12 opacity-80 leading-relaxed italic">
              {t.ctaDesc}
            </p>
            <button
              onClick={onStart}
              className="px-12 py-6 sm:px-16 sm:py-8 bg-white text-emerald-600 rounded-[32px] font-black text-sm sm:text-lg uppercase tracking-[0.2em] hover:scale-110 transition-transform active:scale-95 shadow-2xl"
            >
              {t.ctaBtn}
            </button>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl animate-pulse" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 px-8 pt-20 pb-10 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none"
            />
              <span className="font-black text-2xl text-gray-900 dark:text-white uppercase tracking-tighter">Rezeki<span className="text-emerald-500">Q</span></span>
            </div>
            <p className="max-w-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
              {t.footerDesc}
            </p>
          </div>

          <div>
            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs mb-6">{t.footerNavTitle}</h4>
            <ul className="space-y-4">
              {navLinks.map(l => <li key={l.id}><button onClick={() => scrollTo(l.id)} className="text-gray-500 hover:text-emerald-600 transition-colors text-sm font-medium">{l.name}</button></li>)}
              <li><button onClick={() => setModalContent({ title: t.footerAboutUs, content: t.footerAboutContent })} className="text-gray-500 hover:text-emerald-600 transition-colors text-sm font-medium">{t.footerAboutUs}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs mb-6">{t.footerConnect}</h4>
            <div className="grid grid-cols-3 gap-3">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all border border-transparent hover:border-emerald-200 shadow-sm"
                >
                  <Icon size={20}>{s.icon}</Icon>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center md:text-left leading-relaxed">{t.footerCopyright}</p>
          <div className="flex gap-6">
            <button onClick={() => setModalContent({ title: t.footerPolicyTitle, content: t.footerPolicyContent })} className="text-[10px] font-black text-gray-400 hover:text-emerald-500 uppercase tracking-widest">{t.footerPolicy}</button>
            <button onClick={() => setModalContent({ title: t.footerTermsTitle, content: t.footerTermsContent })} className="text-[10px] font-black text-gray-400 hover:text-emerald-500 uppercase tracking-widest">{t.footerTerms}</button>
          </div>
        </div>
      </footer>

      {/* Pop-up Modal */}
      <AnimatePresence>
        {modalContent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalContent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
            >
              {/* Decorative Gradient */}
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />

              <div className="relative z-10">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 italic">{modalContent.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">{modalContent.content}</p>
                <button
                  onClick={() => setModalContent(null)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-emerald-200 shadow-lg transition-all active:scale-95"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
        body {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};
