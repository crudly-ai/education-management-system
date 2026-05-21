import React from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { BrandProvider, useBrand } from '@/contexts/brand-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Pencil, Sparkles, SlidersHorizontal, Download } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
    footer?: React.ReactNode;
}

const steps = [
    { icon: Pencil,            title: 'Write Your Idea',          desc: 'Describe what you want to build' },
    { icon: Sparkles,          title: 'Crudly Generates Modules', desc: 'CRUD, roles, media & more' },
    { icon: SlidersHorizontal, title: 'Preview & Customize',      desc: 'Modify using simple prompts' },
    { icon: Download,          title: 'Download & Run',           desc: 'Get ready-to-use code instantly' },
];

// Loop = 8s. Each step = 2s (25%). Fade in/out = 0.4s.
// Step 1: 0-25%, Step 2: 25-50%, Step 3: 50-75%, Step 4: 75-100%
// Arrow i activates at boundary: Arrow0=25%, Arrow1=50%, Arrow2=75%
const CSS = `
@keyframes float-slow {
  0%,100% { transform: translateY(0) translateX(0); }
  33%     { transform: translateY(-18px) translateX(8px); }
  66%     { transform: translateY(10px) translateX(-6px); }
}
@keyframes float-slow-reverse {
  0%,100% { transform: translateY(0) translateX(0); }
  33%     { transform: translateY(14px) translateX(-10px); }
  66%     { transform: translateY(-10px) translateX(8px); }
}
@keyframes float-mid {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-12px); }
}
.glow-1 { animation: float-slow 9s ease-in-out infinite; }
.glow-2 { animation: float-slow-reverse 11s ease-in-out infinite; }
.glow-3 { animation: float-mid 7s ease-in-out infinite; }

@keyframes fade-slide-down {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.anim-title   { animation: fade-slide-down 0.6s ease both; }
.anim-tagline { animation: fade-in 0.6s ease both; animation-delay: 1.1s; }

/* Step highlight loop — 8s total */
@keyframes step-hl-0 {
  0%    { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
  5%    { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.70); box-shadow: 0 0 18px rgba(255,255,255,0.15); }
  20%   { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.70); box-shadow: 0 0 18px rgba(255,255,255,0.15); }
  25%   { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
  100%  { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
}
@keyframes step-hl-1 {
  0%    { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
  25%   { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
  30%   { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.70); box-shadow: 0 0 18px rgba(255,255,255,0.15); }
  45%   { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.70); box-shadow: 0 0 18px rgba(255,255,255,0.15); }
  50%   { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
  100%  { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
}
@keyframes step-hl-2 {
  0%    { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
  50%   { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
  55%   { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.70); box-shadow: 0 0 18px rgba(255,255,255,0.15); }
  70%   { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.70); box-shadow: 0 0 18px rgba(255,255,255,0.15); }
  75%   { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
  100%  { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
}
@keyframes step-hl-3 {
  0%    { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
  75%   { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
  80%   { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.70); box-shadow: 0 0 18px rgba(255,255,255,0.15); }
  95%   { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.70); box-shadow: 0 0 18px rgba(255,255,255,0.15); }
  100%  { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); box-shadow: none; }
}

.step-card-0 { animation: step-hl-0 8s ease-in-out infinite; border: 1px solid rgba(255,255,255,0.15); }
.step-card-1 { animation: step-hl-1 8s ease-in-out infinite; border: 1px solid rgba(255,255,255,0.15); }
.step-card-2 { animation: step-hl-2 8s ease-in-out infinite; border: 1px solid rgba(255,255,255,0.15); }
.step-card-3 { animation: step-hl-3 8s ease-in-out infinite; border: 1px solid rgba(255,255,255,0.15); }

/* Arrow highlight — activates at boundary between steps */
@keyframes arrow-hl-0 {
  0%   { opacity: 0.25; }
  20%  { opacity: 0.25; }
  25%  { opacity: 1; }
  30%  { opacity: 0.25; }
  100% { opacity: 0.25; }
}
@keyframes arrow-hl-1 {
  0%   { opacity: 0.25; }
  45%  { opacity: 0.25; }
  50%  { opacity: 1; }
  55%  { opacity: 0.25; }
  100% { opacity: 0.25; }
}
@keyframes arrow-hl-2 {
  0%   { opacity: 0.25; }
  70%  { opacity: 0.25; }
  75%  { opacity: 1; }
  80%  { opacity: 0.25; }
  100% { opacity: 0.25; }
}

@keyframes arrow-bounce {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(4px); }
}

.arrow-0 { animation: arrow-hl-0 8s ease-in-out infinite, arrow-bounce 1.4s ease-in-out infinite; }
.arrow-1 { animation: arrow-hl-1 8s ease-in-out infinite, arrow-bounce 1.4s ease-in-out infinite; }
.arrow-2 { animation: arrow-hl-2 8s ease-in-out infinite, arrow-bounce 1.4s ease-in-out infinite; }
`;

function AuthSimpleLayoutInner({ children, title, description, footer }: AuthLayoutProps) {
    const { getPrimaryColor } = useBrand();

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            <div className="flex min-h-svh">
                {/* Left panel */}
                <div
                    className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
                    style={{ backgroundColor: '#020617', backgroundImage: 'radial-gradient(at 0% 0%, rgba(255, 77, 32, 0.18) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(124, 58, 237, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255, 0, 128, 0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.15) 0px, transparent 50%)' }}
                >
                    {/* Title & Subtitle */}
                    <div className="anim-title mb-10 text-center relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-2">Build Systems with AI</h2>
                        <p className="text-white/70 text-sm">Describe your idea. Crudly builds the rest.</p>
                    </div>

                    {/* Steps */}
                    <div className="w-full max-w-xs flex flex-col items-center relative z-10">
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            return (
                            <div key={i} className="w-full flex flex-col items-center">
                                <div className={`step-card-${i} flex items-start gap-4 w-full rounded-2xl px-5 py-4`}>
                                    <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-base">{step.title}</p>
                                        <p className="text-white/65 text-xs mt-0.5">{step.desc}</p>
                                    </div>
                                </div>

                                {i < steps.length - 1 && (
                                    <div className={`arrow-${i} flex flex-col items-center my-1`}>
                                        <div className="w-px h-3 border-l-2 border-dashed border-white/60" />
                                        <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                                            <path d="M1 1L6 6L11 1" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>

                    {/* Bottom tagline */}
                    <div className="anim-tagline mt-10 flex items-center gap-2 relative z-10">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <p className="text-white/60 text-xs">Trusted by 1,000+ developers</p>
                    </div>
                </div>

                {/* Right panel — original form, untouched */}
                <div className="bg-background flex w-full lg:w-1/2 min-h-svh flex-col items-center justify-center gap-4 p-4 md:p-10 relative">
                    <div className="absolute top-6 right-6">
                        <LanguageSwitcher />
                    </div>
                    {/* Logo — outside the bordered card */}
                    <Link href={route('login')} className="flex flex-col items-center font-medium mb-5">
                        <div className="flex h-auto w-34 items-center justify-center rounded-md">
                            <AppLogoIcon className="h-auto w-auto object-contain" />
                        </div>
                    </Link>
                    <div className="w-full" style={{maxWidth:'450px', border:'1px solid #ced4ce', borderRadius:'16px', padding:'16px', backgroundColor:'#f8faf8'}}>
                        <div className="flex flex-col rounded-xl p-4 pt-6 pb-8" style={{border:'1px solid #ced4ce', backgroundColor:'#ffffff'}}>
                            <div className="flex flex-col items-center gap-4">
                                <div className="space-y-2 text-center mb-8">
                                    <h1 className="md:text-2xl text-xl font-medium">{title}</h1>
                                    <p className="text-muted-foreground text-center text-sm">{description}</p>
                                </div>
                            </div>
                            {children}
                        </div>
                        {footer && (
                            <div className="text-muted-foreground text-center text-sm flex justify-center mt-4">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default function AuthSimpleLayout(props: AuthLayoutProps) {
    return (
        <BrandProvider>
            <AuthSimpleLayoutInner {...props} />
        </BrandProvider>
    );
}
