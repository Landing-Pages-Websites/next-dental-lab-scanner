"use client";

import Image from "next/image";
import { useState, FormEvent, useRef } from "react";
import { useTracking } from "@/hooks/useTracking";

/* ─── Form dropdown options (from source HubSpot form) ─── */
const DROPDOWN_OPTIONS = [
  { value: "", label: "Please Select" },
  { value: "Doctor", label: "Dentist" },
  { value: "Office Manager", label: "Dental Office Manager" },
  { value: "Dental Hygienist", label: "Dental Office Team Member" },
  { value: "Laboratory Owner", label: "Dental Lab" },
  { value: "Patient", label: "Patient" },
  { value: "DSO Practice", label: "DSO Practice" },
  { value: "DSO Corporate", label: "DSO Corporate" },
  { value: "Dental School", label: "Dental School" },
  { value: "Dental Student", label: "Dental Student" },
  { value: "Dental Technician", label: "Dental Technician" },
  { value: "I need a dentist", label: "I need a dentist" },
  { value: "Other", label: "Other" },
];

/* ─── FAQs (scraped from nextdentallab.com/digital-scanner-form/) ─── */
const FAQS = [
  {
    q: "How does the scanner reimbursement work?",
    a: "Once you purchase your scanner and start sending digital cases to Next Dental Lab, we\u2019ll apply a monthly credit to your account. The total reimbursement equals the scanner\u2019s purchase price and is paid out over a set number of months based on your case volume.",
  },
  {
    q: "Do I have to buy a specific scanner model or use a specific dealer?",
    a: "Nope. You choose the scanner model, dealer, and supplier. As long as it\u2019s an intraoral scanner (IOS) purchased on or after April 1, 2025, it qualifies.",
  },
  {
    q: "What\u2019s required to qualify for this program?",
    a: "You must be a licensed dentist actively operating in the U.S. You must provide proof of purchase and payment for your scanner. You must meet a minimum monthly case volume with Next Dental Lab.",
  },
  {
    q: "What happens if I don\u2019t meet the case volume one month?",
    a: "If your monthly digital case volume falls short or your account is past due, the credit for that month will be forfeited. No worries though \u2014 you can still qualify for credits in future months once you\u2019re back on track.",
  },
  {
    q: "Is there a long-term commitment?",
    a: "No long-term commitment required. However, in order to continue qualifying for monthly credits make sure to send the minimum monthly requirement of digital cases.",
  },
  {
    q: "What is the minimum monthly case requirement for reimbursement?",
    a: "To qualify for the full reimbursement of your intraoral scanner, you must send a minimum number of digital cases to Next Dental Lab each month. The exact number depends on your scanner\u2019s purchase price and chosen reimbursement period.",
  },
  {
    q: "Is there a penalty if I stop sending cases?",
    a: "There\u2019s no financial penalty, but if you stop sending cases, you won\u2019t receive further reimbursement credits. Your participation is flexible \u2014 no long-term contract required.",
  },
  {
    q: "Can I choose a longer or shorter reimbursement period?",
    a: "Yes! You can select a reimbursement period (e.g., 12, 24, 36 months) that aligns with your expected case volume. A shorter term requires a higher monthly case volume, while a longer term allows for a lower case requirement.",
  },
];

/* ─── Validation ─── */
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  const d = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (d.length !== 10) return "Please enter a valid 10-digit phone number.";
  if (!/^[2-9]/.test(d)) return "Area code must start with 2\u20139.";
  if (!/^.{3}[2-9]/.test(d)) return "Exchange must start with 2\u20139.";
  if (["211","311","411","511","611","711","811","911"].includes(d.slice(0,3)))
    return "N11 service codes are not valid phone numbers.";
  if (d.slice(3,6) === "555") return "555 numbers are not valid.";
  if (["800","888","877","866","855","844","833","822","900"].includes(d.slice(0,3)))
    return "Toll-free/premium numbers are not accepted.";
  if (/^(\d)\1{9}$/.test(d)) return "Please enter a real phone number.";
  if (["1234567890","0987654321"].includes(d)) return "Please enter a real phone number.";
  return null;
}

/* ─── Chevron SVG reusable ─── */
function ChevronDown({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/* ─── Check icon ─── */
function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-[#92F7C8] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

/* ────────────────────────────────────────── */
/*                    PAGE                     */
/* ────────────────────────────────────────── */

/* ─── Reusable Form Component ─── */
function LeadForm({ formData, errors, submitting, submitted, handleChange, handlePhoneBlur, handleSubmit, formRef, id, className = "" }: any) {
  return (
    <div id={id} className={`bg-white rounded-2xl p-6 sm:p-8 shadow-2xl scroll-mt-24 ${className}`}>
      {submitted ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#92F7C8] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#00163F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#00163F] mb-2">Thank You!</h3>
          <p className="text-gray-600">We&apos;ll be in touch shortly to help you get started with the Digital Scanner Reimbursement Program.</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl sm:text-2xl font-bold text-[#00163F] mb-1">
            Ready to <span className="text-[#FF4820]">go digital?</span>
          </h2>
          <p className="text-gray-600 mb-6">Fill out the form below and we will make it happen.</p>
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormFields formData={formData} errors={errors} handleChange={handleChange} handlePhoneBlur={handlePhoneBlur} />
            <button type="submit" disabled={submitting || submitted}
              className="w-full bg-[#FF4820] hover:bg-[#E63D18] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-colors text-lg">
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <p className="text-xs text-gray-400 text-center">
              For licensed dentists only. By submitting, you agree to be contacted about the program.
            </p>
          </form>
        </>
      )}
    </div>
  );
}

/* ─── Form Fields (shared between hero and footer forms) ─── */
function FormFields({ formData, errors, handleChange, handlePhoneBlur }: any) {
  return (
    <>
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-[#00163F] mb-1">Email<span className="text-[#FF4820]">*</span></label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email"
          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-colors ${errors.email ? "border-red-500" : "border-gray-300 hover:border-gray-400"}`} required />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>
      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-[#00163F] mb-1">Phone Number<span className="text-[#FF4820]">*</span></label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handlePhoneBlur}
          placeholder="(555) 555-5555" maxLength={14}
          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-colors ${errors.phone ? "border-red-500" : "border-gray-300 hover:border-gray-400"}`} required />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>
      {/* Office Name */}
      <div>
        <label className="block text-sm font-medium text-[#00163F] mb-1">Office Name<span className="text-[#FF4820]">*</span></label>
        <input type="text" name="officeName" value={formData.officeName} onChange={handleChange} placeholder="Practice name"
          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-colors ${errors.officeName ? "border-red-500" : "border-gray-300 hover:border-gray-400"}`} required />
        {errors.officeName && <p className="text-red-500 text-sm mt-1">{errors.officeName}</p>}
      </div>
      {/* Doctor Name */}
      <div>
        <label className="block text-sm font-medium text-[#00163F] mb-1">Doctor Name<span className="text-[#FF4820]">*</span></label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name"
              className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-colors ${errors.firstName ? "border-red-500" : "border-gray-300 hover:border-gray-400"}`} required />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name"
              className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-colors ${errors.lastName ? "border-red-500" : "border-gray-300 hover:border-gray-400"}`} required />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>
      </div>
      {/* What best describes you? */}
      <div>
        <label className="block text-sm font-medium text-[#00163F] mb-1">What best describes you?<span className="text-[#FF4820]">*</span></label>
        <div className="relative">
          <select name="describes" value={formData.describes} onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 appearance-none bg-white transition-colors ${errors.describes ? "border-red-500" : "border-gray-300 hover:border-gray-400"} ${!formData.describes ? "text-gray-400" : ""}`} required>
            {DROPDOWN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        {errors.describes && <p className="text-red-500 text-sm mt-1">{errors.describes}</p>}
      </div>
    </>
  );
}

export default function Home() {
  useTracking({
    siteKey: "sk_5deoi877_w44rzjy472",
    gtmId: "GTM-T4N82VR8",
  });

  const [formData, setFormData] = useState({
    email: "", phone: "", officeName: "", firstName: "", lastName: "", describes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  }

  function handlePhoneBlur() {
    if (formData.phone.trim()) {
      const err = validatePhone(formData.phone);
      if (err) setErrors((prev) => ({ ...prev, phone: err }));
    }
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!formData.email.trim()) e.email = "Email is required.";
    else if (!validateEmail(formData.email)) e.email = "Please enter a valid email.";
    if (!formData.phone.trim()) e.phone = "Phone number is required.";
    else { const pe = validatePhone(formData.phone); if (pe) e.phone = pe; }
    if (!formData.officeName.trim()) e.officeName = "Office name is required.";
    if (!formData.firstName.trim()) e.firstName = "First name is required.";
    if (!formData.lastName.trim()) e.lastName = "Last name is required.";
    if (!formData.describes) e.describes = "Please select an option.";
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (submitting || submitted) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = {
        email: formData.email, phone: formData.phone, company: formData.officeName,
        firstname: formData.firstName, lastname: formData.lastName,
        what_best_describes_you_: formData.describes,
        source: "landing-page", page: window.location.href,
      };
      if ((window as any).API_ENDPOINT) {
        await fetch((window as any).API_ENDPOINT + "/lead", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        }).catch(() => {});
      }
      if ((window as any).MegaTag) {
        (window as any).MegaTag.trackEvent("form_submit", { formData: payload });
      }
      setSubmitted(true);
    } catch { setSubmitted(true); } finally { setSubmitting(false); }
  }

  function scrollToForm() {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* ── HEADER ── */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
          <a href="https://www.nextdentallab.com" target="_blank" rel="noopener noreferrer">
            <Image src="/images/logo.png" alt="Next Dental Lab" width={160} height={87} className="h-14 w-auto" priority />
          </a>
          <div className="flex items-center gap-4">
            <button onClick={scrollToForm}
              className="bg-[#FF4820] hover:bg-[#E63D18] text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm sm:text-base">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO + FORM ── */}
      <section className="bg-[#00163F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-poppins)" }}>
                Go Digital,<br /><span className="text-[#92F7C8]">On Us.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-8 max-w-lg">
                Your time to go digital is now. Next Dental Lab is making it easier than ever to transition
                by reimbursing you for <strong>ANY 3D scanner</strong>. Whether you already own one or are
                looking to invest, this is your chance to streamline workflows, enhance efficiency, and grow
                your practice with <strong>zero risk</strong>.
              </p>
              <div className="mb-10">
                <button onClick={scrollToForm}
                  className="bg-[#FF4820] hover:bg-[#E63D18] text-white font-semibold px-8 py-4 rounded-full transition-colors text-lg">
                  See How You Qualify
                </button>
              </div>
              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                {[
                  { num: "15+", label: "Years in Business" },
                  { num: "ANY", label: "Scanner Qualifies" },
                  { num: "100%", label: "Reimbursement" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-[#92F7C8]">{s.num}</div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEAD FORM */}
            <LeadForm id="lead-form" formData={formData} errors={errors} submitting={submitting}
              submitted={submitted} handleChange={handleChange} handlePhoneBlur={handlePhoneBlur} handleSubmit={handleSubmit} formRef={formRef} />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="bg-[#001B4D] py-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center text-sm text-gray-300">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#92F7C8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Full-Service Dental Lab
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#92F7C8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              15+ Years Serving Dental Practices
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#92F7C8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Rush Service Available
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#92F7C8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Digital &amp; Traditional Workflows
            </span>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#FF4820] font-semibold text-center uppercase tracking-wider text-sm mb-3">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#00163F] text-center mb-4" style={{ fontFamily: "var(--font-poppins)" }}>
            How the Reimbursement Works
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-14 text-lg">
            Three straightforward steps to get your scanner paid for.
          </p>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-20 left-[17%] right-[17%] h-0.5 bg-gray-200" />
            {[
              {
                step: "01", title: "Purchase Any Scanner",
                desc: "Choose any intraoral scanner (IOS) model from any dealer or supplier. As long as it was purchased on or after April 1, 2025, it qualifies. No brand restrictions.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                ),
              },
              {
                step: "02", title: "Send Digital Cases",
                desc: "Start sending your digital cases to Next Dental Lab. Meet the minimum monthly case volume requirement to stay eligible for monthly credits.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ),
              },
              {
                step: "03", title: "Get Reimbursed Monthly",
                desc: "Receive monthly credits applied directly to your account. Over time, earn back up to 100% of your scanner\u2019s full purchase price.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="text-center bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow relative z-10">
                <div className="w-16 h-16 bg-[#00163F] rounded-full flex items-center justify-center mx-auto mb-4 text-[#92F7C8]">
                  {item.icon}
                </div>
                <span className="text-sm font-bold text-[#FF4820] tracking-wider uppercase">Step {item.step}</span>
                <h3 className="text-xl font-bold text-[#00163F] mt-2 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={scrollToForm}
              className="bg-[#FF4820] hover:bg-[#E63D18] text-white font-semibold px-8 py-4 rounded-full transition-colors text-lg">
              See How You Qualify
            </button>
          </div>
        </div>
      </section>

      {/* ── PROGRAM DETAILS / WHAT YOU GET ── */}
      <section className="bg-[#00163F] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-[#92F7C8] font-semibold uppercase tracking-wider text-sm mb-3">Program Details</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ fontFamily: "var(--font-poppins)" }}>
                Your Scanner Pays for Itself
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Next Dental Lab&apos;s Digital Scanner Reimbursement Program is designed to remove the
                financial barrier to going digital. Once you purchase your scanner and start sending digital
                cases, we apply a monthly credit to your account. The total reimbursement equals the
                scanner&apos;s purchase price and is paid out over a set number of months based on your case volume.
              </p>
              <ul className="space-y-4">
                {[
                  "Choose ANY intraoral scanner from ANY dealer or supplier",
                  "Earn up to 100% of your scanner\u2019s purchase price back in lab credits",
                  "Select a reimbursement period that fits your case volume (e.g., 12, 24, or 36 months)",
                  "No long-term contracts or commitments required",
                  "Credits applied monthly to your Next Dental Lab account",
                  "No penalties if you miss a month \u2014 resume sending cases and credits continue",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl overflow-hidden border border-white/10">
              <div className="relative h-56 overflow-hidden">
                <Image src="/images/scanner-program.png" alt="Digital scanner reimbursement program" width={1000} height={1000} className="w-full h-full object-cover" />
              </div>
              <div className="p-8">
              <h3 className="text-xl font-bold text-[#92F7C8] mb-6">How Reimbursement Works</h3>
              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-3 border-b border-white/10 pb-4">
                  <span className="text-[#92F7C8] font-bold text-lg shrink-0">1.</span>
                  <div><span className="font-semibold text-white">Purchase any scanner</span><br /><span className="text-gray-400">Any IOS model, any dealer, purchased on or after April 1, 2025.</span></div>
                </div>
                <div className="flex items-start gap-3 border-b border-white/10 pb-4">
                  <span className="text-[#92F7C8] font-bold text-lg shrink-0">2.</span>
                  <div><span className="font-semibold text-white">Send digital cases monthly</span><br /><span className="text-gray-400">Meet the minimum monthly case volume to qualify for credits.</span></div>
                </div>
                <div className="flex items-start gap-3 border-b border-white/10 pb-4">
                  <span className="text-[#92F7C8] font-bold text-lg shrink-0">3.</span>
                  <div><span className="font-semibold text-white">Receive monthly lab credits</span><br /><span className="text-gray-400">Credits applied to your account each month based on your case volume.</span></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#92F7C8] font-bold text-lg shrink-0">4.</span>
                  <div><span className="font-semibold text-white">Earn back up to 100%</span><br /><span className="text-gray-400">Over time, your scanner&apos;s full purchase price is reimbursed through credits.</span></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-6">
                Terms and conditions apply. Contact us for full program details.
              </p>
              <button onClick={scrollToForm}
                className="w-full mt-6 bg-[#FF4820] hover:bg-[#E63D18] text-white font-bold py-4 rounded-lg transition-colors text-lg">
                Get Started Now
              </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY GO DIGITAL ── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#FF4820] font-semibold text-center uppercase tracking-wider text-sm mb-3">Benefits</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#00163F] text-center mb-4" style={{ fontFamily: "var(--font-poppins)" }}>
            Why Go Digital?
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12 text-lg">
            Digital workflows are transforming dental practices across the country.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Faster Turnaround",
                desc: "Digital impressions eliminate shipping time. Get cases started the same day you scan.",
                icon: (
                  <svg className="w-7 h-7 text-[#FF4820]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                title: "Better Accuracy",
                desc: "Digital scans reduce remakes and adjustments with precision fit, saving time and money.",
                icon: (
                  <svg className="w-7 h-7 text-[#FF4820]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "Patient Comfort",
                desc: "No more messy impression trays. Patients prefer the comfort of digital scans.",
                icon: (
                  <svg className="w-7 h-7 text-[#FF4820]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "Zero Financial Risk",
                desc: "Your scanner pays for itself through lab credits. No long-term contracts required.",
                icon: (
                  <svg className="w-7 h-7 text-[#FF4820]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-[#00163F] mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={scrollToForm}
              className="bg-[#FF4820] hover:bg-[#E63D18] text-white font-semibold px-8 py-4 rounded-full transition-colors text-lg">
              Fill Out the Form to Qualify
            </button>
          </div>
        </div>
      </section>

      {/* ── WHO QUALIFIES ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#FF4820] font-semibold uppercase tracking-wider text-sm mb-3">Eligibility</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#00163F] mb-6" style={{ fontFamily: "var(--font-poppins)" }}>
                Who Qualifies?
              </h2>
              <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden mb-8">
                <Image src="/images/hero-dental.png" alt="Next Dental Lab team at work" width={1420} height={800} className="w-full h-full object-cover" />
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                The program is designed for dental professionals who want to go digital or who have
                recently invested in scanning technology.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Licensed Dentists", desc: "Must be a licensed dentist actively operating a practice in the United States." },
                  { title: "New Scanner Purchases", desc: "Scanner must be an intraoral scanner (IOS) purchased on or after April 1, 2025." },
                  { title: "Any Brand, Any Dealer", desc: "No restrictions on scanner brand, model, or dealer. You pick the scanner that works best for your practice." },
                  { title: "Minimum Case Volume", desc: "Must meet a minimum monthly digital case volume with Next Dental Lab to qualify for monthly credits." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <CheckIcon />
                    <div>
                      <h4 className="font-semibold text-[#00163F]">{item.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#00163F] to-[#001B4D] rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-poppins)" }}>Next Dental Lab Products</h3>
              <div className="relative h-48 rounded-xl overflow-hidden mb-6 bg-white/10">
                <Image src="/images/crown-bridge.png" alt="Crown and bridge dental products" width={1000} height={1000} className="w-full h-full object-contain p-4" />
              </div>
              <p className="text-gray-300 mb-6 text-sm">
                When you send digital cases, you have access to our full product line:
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Crown & Bridge", "Removables", "Dental Implants",
                  "Hybrid Dentures", "Full Zirconia", "Digital Cases",
                ].map((p) => (
                  <div key={p} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 bg-[#92F7C8] rounded-full shrink-0" />
                    <span className="text-gray-200">{p}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  Quality dental products at competitive prices. Each order custom made for proper fit,
                  comfort, and longevity. Rush service available for select products.
                </p>
              </div>
              <button onClick={scrollToForm}
                className="w-full mt-6 bg-[#92F7C8] hover:bg-[#7DE0B3] text-[#00163F] font-bold py-4 rounded-lg transition-colors text-lg">
                Check If You Qualify
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#FF4820] font-semibold text-center uppercase tracking-wider text-sm mb-3">Got Questions?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#00163F] text-center mb-12" style={{ fontFamily: "var(--font-poppins)" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-[#00163F] pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#FF4820] shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <div className={`faq-answer ${openFaq === i ? "open" : ""}`}
                  style={{ padding: openFaq === i ? "0 1.25rem 1.25rem" : "0 1.25rem" }}>
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={scrollToForm}
              className="bg-[#FF4820] hover:bg-[#E63D18] text-white font-semibold px-8 py-4 rounded-full transition-colors text-lg">
              Ready? Fill Out the Form
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA + FORM ── */}
      <section className="bg-[#00163F] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-8">
                <Image src="/images/banner.png" alt="Next Dental Lab digital workflow" width={1920} height={870} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-poppins)" }}>
                Don&apos;t Let Cost Hold You Back
              </h2>
              <p className="text-gray-300 text-lg mb-6 max-w-lg">
                Your time to go digital is now. Fill out the form and our team will walk you through
                exactly how the reimbursement program works for your practice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={scrollToForm}
                  className="bg-[#FF4820] hover:bg-[#E63D18] text-white font-bold px-8 py-4 rounded-full transition-colors text-lg">
                  Get Started Now
                </button>
              </div>
            </div>
            <LeadForm id="footer-form" formData={formData} errors={errors} submitting={submitting}
              submitted={submitted} handleChange={handleChange} handlePhoneBlur={handlePhoneBlur} handleSubmit={handleSubmit} formRef={null} />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#00163F] border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image src="/images/logo.png" alt="Next Dental Lab" width={120} height={65}
            className="h-10 w-auto brightness-0 invert" />
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Next Dental Lab. All rights reserved.</p>
        </div>
      </footer>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:hidden z-50">
        <button onClick={scrollToForm}
          className="w-full bg-[#FF4820] hover:bg-[#E63D18] text-white font-bold py-3 rounded-lg transition-colors">
          Get Started \u2014 Fill Out Form
        </button>
      </div>
    </main>
  );
}
