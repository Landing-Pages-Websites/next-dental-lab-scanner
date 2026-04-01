"use client";

import Image from "next/image";
import { useState, FormEvent, useRef } from "react";

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

const FAQS = [
  {
    question: "How does the scanner reimbursement work?",
    answer:
      "Once you purchase your scanner and start sending digital cases to Next Dental Lab, we'll apply a monthly credit to your account. The total reimbursement equals the scanner's purchase price and is paid out over a set number of months based on your case volume.",
  },
  {
    question:
      "Do I have to buy a specific scanner model or use a specific dealer?",
    answer:
      "Nope. You choose the scanner model, dealer, and supplier. As long as it's an intraoral scanner (IOS) purchased on or after April 1, 2025, it qualifies.",
  },
  {
    question: "What's required to qualify for this program?",
    answer:
      "You must be a licensed dentist actively operating in the U.S. You must provide proof of purchase and payment for your scanner. You must meet a minimum monthly case volume with Next Dental Lab.",
  },
  {
    question: "What happens if I don't meet the case volume one month?",
    answer:
      "If your monthly digital case volume falls short or your account is past due, the credit for that month will be forfeited. No worries though \u2014 you can still qualify for credits in future months once you're back on track.",
  },
  {
    question: "Is there a long-term commitment?",
    answer:
      "No long-term commitment required. However, in order to continue qualifying for monthly credits make sure to send the minimum monthly requirement of digital cases.",
  },
  {
    question:
      "What is the minimum monthly case requirement for reimbursement?",
    answer:
      "To qualify for the full reimbursement of your intraoral scanner, you must send a minimum number of digital cases to Next Dental Lab each month. The exact number depends on your scanner's purchase price and chosen reimbursement period.",
  },
  {
    question: "Is there a penalty if I stop sending cases?",
    answer:
      "There's no financial penalty, but if you stop sending cases, you won't receive further reimbursement credits. Your participation is flexible \u2014 no long-term contract required.",
  },
  {
    question: "Can I choose a longer or shorter reimbursement period?",
    answer:
      "Yes! You can select a reimbursement period (e.g., 12, 24, 36 months) that aligns with your expected case volume. A shorter term requires a higher monthly case volume, while a longer term allows for a lower case requirement.",
  },
];

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return validatePhoneDigits(digits.slice(1));
  }
  if (digits.length !== 10) return "Please enter a valid 10-digit phone number.";
  return validatePhoneDigits(digits);
}

function validatePhoneDigits(d: string): string | null {
  if (!/^[2-9]/.test(d)) return "Area code must start with 2-9.";
  if (!/^.{3}[2-9]/.test(d)) return "Exchange must start with 2-9.";
  const n11 = ["211","311","411","511","611","711","811","911"];
  if (n11.includes(d.slice(0,3))) return "N11 service codes are not valid phone numbers.";
  if (d.slice(3,6) === "555") return "555 numbers are not valid.";
  const tollFree = ["800","888","877","866","855","844","833","822","900"];
  if (tollFree.includes(d.slice(0,3))) return "Toll-free/premium numbers are not accepted.";
  if (/^(\d)\1{9}$/.test(d)) return "Please enter a real phone number.";
  const fakes = ["1234567890","0987654321","1111111111"];
  if (fakes.includes(d)) return "Please enter a real phone number.";
  return null;
}

export default function Home() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    officeName: "",
    firstName: "",
    lastName: "",
    describes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!formData.email.trim()) errs.email = "Email is required.";
    else if (!validateEmail(formData.email))
      errs.email = "Please enter a valid email.";
    if (!formData.phone.trim()) errs.phone = "Phone number is required.";
    else {
      const phoneErr = validatePhone(formData.phone);
      if (phoneErr) errs.phone = phoneErr;
    }
    if (!formData.officeName.trim())
      errs.officeName = "Office name is required.";
    if (!formData.firstName.trim())
      errs.firstName = "First name is required.";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required.";
    if (!formData.describes) errs.describes = "Please select an option.";
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting || submitted) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        email: formData.email,
        phone: formData.phone,
        company: formData.officeName,
        firstname: formData.firstName,
        lastname: formData.lastName,
        what_best_describes_you_: formData.describes,
        source: "landing-page",
        page: window.location.href,
      };

      // Submit to Mega lead API if configured
      if (typeof window !== "undefined" && (window as any).API_ENDPOINT) {
        await fetch((window as any).API_ENDPOINT + "/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }

      // Track form submit event
      if (typeof window !== "undefined" && (window as any).MegaTag) {
        (window as any).MegaTag.trackEvent("form_submit", {
          formData: payload,
        });
      }

      setSubmitted(true);
    } catch {
      // Show success anyway to not block the user
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToForm() {
    const el = document.getElementById("lead-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
          <a href="https://www.nextdentallab.com" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/logo.png"
              alt="Next Dental Lab"
              width={160}
              height={87}
              className="h-14 w-auto"
              priority
            />
          </a>
          <button
            onClick={scrollToForm}
            className="bg-[#FF4820] hover:bg-[#E63D18] text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm sm:text-base"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#00163F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: Hero copy */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-poppins)" }}>
                Go Digital,
                <br />
                <span className="text-[#92F7C8]">On Us.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-8 max-w-lg">
                Your time to go digital is now. Next Dental Lab is making it
                easier than ever to transition by reimbursing you for{" "}
                <strong>ANY 3D scanner</strong>. Whether you already own one or
                are looking to invest, this is your chance to streamline
                workflows, enhance efficiency, and grow your practice with{" "}
                <strong>zero risk</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToForm}
                  className="bg-[#FF4820] hover:bg-[#E63D18] text-white font-semibold px-8 py-4 rounded-full transition-colors text-lg"
                >
                  See How You Qualify
                </button>
                <a
                  href="tel:5612858828"
                  className="border-2 border-white/30 hover:border-white text-white font-medium px-8 py-4 rounded-full transition-colors text-lg text-center"
                >
                  Call (561) 285-8828
                </a>
              </div>
            </div>

            {/* Right: Lead Form */}
            <div id="lead-form" className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl scroll-mt-24">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#92F7C8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-[#00163F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#00163F] mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-600">
                    We&apos;ll be in touch shortly to help you get started with the
                    Digital Scanner Reimbursement Program.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#00163F] mb-1">
                    Ready to <span className="text-[#FF4820]">go digital?</span>
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Fill out the form below and we will make it happen.
                  </p>
                  <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-4"
                  >
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-[#00163F] mb-1">
                        Email<span className="text-[#FF4820]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-colors ${
                          errors.email
                            ? "border-red-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        required
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-[#00163F] mb-1">
                        Phone Number<span className="text-[#FF4820]">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 555-5555"
                        className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-colors ${
                          errors.phone
                            ? "border-red-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        required
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Office Name */}
                    <div>
                      <label className="block text-sm font-medium text-[#00163F] mb-1">
                        Office Name<span className="text-[#FF4820]">*</span>
                      </label>
                      <input
                        type="text"
                        name="officeName"
                        value={formData.officeName}
                        onChange={handleChange}
                        placeholder="Practice name"
                        className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-colors ${
                          errors.officeName
                            ? "border-red-500"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        required
                      />
                      {errors.officeName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.officeName}
                        </p>
                      )}
                    </div>

                    {/* Doctor Name */}
                    <div>
                      <label className="block text-sm font-medium text-[#00163F] mb-1">
                        Doctor Name<span className="text-[#FF4820]">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="First name"
                            className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-colors ${
                              errors.firstName
                                ? "border-red-500"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            required
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Last name"
                            className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-colors ${
                              errors.lastName
                                ? "border-red-500"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            required
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* What best describes you? */}
                    <div>
                      <label className="block text-sm font-medium text-[#00163F] mb-1">
                        What best describes you?
                        <span className="text-[#FF4820]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="describes"
                          value={formData.describes}
                          onChange={handleChange}
                          className={`w-full border rounded-lg px-4 py-3 text-gray-900 appearance-none bg-white transition-colors ${
                            errors.describes
                              ? "border-red-500"
                              : "border-gray-300 hover:border-gray-400"
                          } ${!formData.describes ? "text-gray-400" : ""}`}
                          required
                        >
                          {DROPDOWN_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      {errors.describes && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.describes}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting || submitted}
                      className="w-full bg-[#FF4820] hover:bg-[#E63D18] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-colors text-lg"
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      For licensed dentists only. By submitting, you agree to be
                      contacted about the program.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#00163F] text-center mb-4" style={{ fontFamily: "var(--font-poppins)" }}>
            How It Works
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12 text-lg">
            Getting reimbursed for your scanner is simple. Here&apos;s how:
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Purchase Any Scanner",
                desc: "Choose any intraoral scanner (IOS) model from any dealer. As long as it was purchased on or after April 1, 2025, it qualifies.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Send Digital Cases",
                desc: "Start sending your digital cases to Next Dental Lab. Meet the minimum monthly case volume to stay eligible for credits.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Get Reimbursed",
                desc: "Receive monthly credits applied to your account. Over time, earn back up to 100% of your scanner's purchase price.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-[#00163F] rounded-full flex items-center justify-center mx-auto mb-4 text-[#92F7C8]">
                  {item.icon}
                </div>
                <span className="text-sm font-bold text-[#FF4820] tracking-wider uppercase">
                  Step {item.step}
                </span>
                <h3 className="text-xl font-bold text-[#00163F] mt-2 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Go Digital */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                desc: "Digital impressions eliminate shipping time. Get cases started the same day.",
                icon: "⚡",
              },
              {
                title: "Better Accuracy",
                desc: "Digital scans reduce remakes and adjustments, saving time and money.",
                icon: "🎯",
              },
              {
                title: "Patient Experience",
                desc: "No more messy impression trays. Patients prefer the comfort of digital scans.",
                icon: "😊",
              },
              {
                title: "Zero Risk",
                desc: "With our reimbursement program, your scanner pays for itself through lab credits.",
                icon: "🛡️",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-bold text-[#00163F] mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#00163F] text-center mb-12" style={{ fontFamily: "var(--font-poppins)" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-[#00163F] pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-[#FF4820] shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`faq-answer ${openFaq === i ? "open" : ""}`}
                  style={{
                    padding: openFaq === i ? "0 1.25rem 1.25rem" : "0 1.25rem",
                  }}
                >
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#00163F] py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-poppins)" }}>
            Your Scanner Pays for Itself
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Don&apos;t let cost hold you back from going digital. Fill out the form
            now to see how you qualify for our scanner reimbursement program.
          </p>
          <button
            onClick={scrollToForm}
            className="bg-[#FF4820] hover:bg-[#E63D18] text-white font-bold px-10 py-4 rounded-full transition-colors text-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#00163F] border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image
            src="/images/logo.png"
            alt="Next Dental Lab"
            width={120}
            height={65}
            className="h-10 w-auto brightness-0 invert"
          />
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Next Dental Lab. All rights
            reserved.
          </p>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:hidden z-50">
        <button
          onClick={scrollToForm}
          className="w-full bg-[#FF4820] hover:bg-[#E63D18] text-white font-bold py-3 rounded-lg transition-colors"
        >
          Get Started — Fill Out Form
        </button>
      </div>
    </main>
  );
}
