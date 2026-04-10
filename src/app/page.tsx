"use client";

import { useMemo, useState } from "react";

type Plan = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  features: string[];
  highlight?: boolean;
  // Replace with a real Stripe test-mode Payment Link to take live test-mode payments.
  // https://dashboard.stripe.com/test/payment-links
  stripePaymentLink?: string;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For founders shipping their first product.",
    price: 29,
    features: [
      "Up to 3 projects",
      "Email support",
      "Community access",
      "7-day free trial",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For teams scaling past product-market fit.",
    price: 99,
    features: [
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "SSO + role permissions",
      "14-day free trial",
    ],
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For companies with compliance requirements.",
    price: 299,
    features: [
      "Everything in Growth",
      "Dedicated success manager",
      "SOC 2 + DPA",
      "Custom contracts",
      "24/7 SLA",
    ],
  },
];

type Customer = {
  name: string;
  email: string;
  company: string;
};

export default function FunnelPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    email: "",
    company: "",
  });
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12 / 34");
  const [cardCvc, setCardCvc] = useState("123");
  const [processing, setProcessing] = useState(false);

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === selectedPlanId) ?? null,
    [selectedPlanId]
  );

  const customerValid =
    customer.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email);

  const paymentValid =
    cardName.trim().length > 1 &&
    cardNumber.replace(/\s/g, "").length >= 12 &&
    /^\d{1,2}\s*\/\s*\d{2}$/.test(cardExpiry) &&
    /^\d{3,4}$/.test(cardCvc);

  const handleSubmitPayment = async () => {
    if (!selectedPlan || !paymentValid) return;

    // ─────────────────────────────────────────────────────────────────
    // To wire this up to real Stripe test mode, either:
    //
    //   1. (Simplest) Create a Payment Link in the Stripe test dashboard
    //      and set plan.stripePaymentLink. Then replace the mock below with:
    //
    //        window.location.href = selectedPlan.stripePaymentLink!;
    //
    //   2. (Full control) Add a serverless function that calls
    //      stripe.checkout.sessions.create({...}) and redirect to
    //      session.url. Requires a backend (Vercel/Netlify function).
    // ─────────────────────────────────────────────────────────────────

    if (selectedPlan.stripePaymentLink) {
      window.location.href = selectedPlan.stripePaymentLink;
      return;
    }

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setProcessing(false);
    setStep(4);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
            S
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold">Solaris</span>
            <span className="text-xs text-slate-500">Checkout demo</span>
          </div>
        </div>
        <Steps current={step} />
      </header>

      {step === 1 && (
        <SelectPlan
          plans={PLANS}
          selectedPlanId={selectedPlanId}
          onSelect={(id) => setSelectedPlanId(id)}
          onNext={() => selectedPlanId && setStep(2)}
        />
      )}

      {step === 2 && selectedPlan && (
        <CustomerInfo
          plan={selectedPlan}
          customer={customer}
          onChange={setCustomer}
          onBack={() => setStep(1)}
          onNext={() => customerValid && setStep(3)}
          canContinue={customerValid}
        />
      )}

      {step === 3 && selectedPlan && (
        <Payment
          plan={selectedPlan}
          customer={customer}
          cardName={cardName}
          cardNumber={cardNumber}
          cardExpiry={cardExpiry}
          cardCvc={cardCvc}
          processing={processing}
          canContinue={paymentValid}
          onChange={{
            setCardName,
            setCardNumber,
            setCardExpiry,
            setCardCvc,
          }}
          onBack={() => setStep(2)}
          onSubmit={handleSubmitPayment}
        />
      )}

      {step === 4 && selectedPlan && (
        <Success
          plan={selectedPlan}
          customer={customer}
          onRestart={() => {
            setStep(1);
            setSelectedPlanId(null);
            setCustomer({ name: "", email: "", company: "" });
          }}
        />
      )}

      <footer className="mt-auto pt-16 text-center text-xs text-slate-400">
        Test card: 4242 4242 4242 4242 · any future date · any 3-digit CVC
      </footer>
    </main>
  );
}

function Steps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const labels = ["Plan", "Your info", "Payment"] as const;
  return (
    <nav aria-label="Progress" className="hidden sm:flex">
      <ol className="flex items-center gap-3">
        {labels.map((label, i) => {
          const stepNum = (i + 1) as 1 | 2 | 3;
          const active = current === stepNum;
          const done = current > stepNum || current === 4;
          return (
            <li key={label} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  done
                    ? "bg-indigo-600 text-white"
                    : active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : stepNum}
              </div>
              <span
                className={`text-sm ${
                  active || done ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {label}
              </span>
              {i < labels.length - 1 && (
                <span className="h-px w-8 bg-slate-200" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function SelectPlan({
  plans,
  selectedPlanId,
  onSelect,
  onNext,
}: {
  plans: Plan[];
  selectedPlanId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Pick your plan
        </h1>
        <p className="mt-2 text-slate-500">
          Start in seconds. Upgrade, downgrade, or cancel anytime — no questions asked.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map((plan) => {
          const selected = plan.id === selectedPlanId;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.id)}
              className={`group relative flex flex-col rounded-2xl border bg-white p-6 text-left transition-all ${
                selected
                  ? "border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {plan.highlight && (
                <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-slate-900">
                  ${plan.price}
                </span>
                <span className="text-sm text-slate-500">/month</span>
              </div>
              <ul className="mt-6 flex flex-col gap-2 text-sm text-slate-600">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!selectedPlanId}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Continue
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 5l7 7-7 7M5 12h15"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}

function CustomerInfo({
  plan,
  customer,
  onChange,
  onBack,
  onNext,
  canContinue,
}: {
  plan: Plan;
  customer: Customer;
  onChange: (c: Customer) => void;
  onBack: () => void;
  onNext: () => void;
  canContinue: boolean;
}) {
  return (
    <section className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Your info
          </h1>
          <p className="mt-2 text-slate-500">
            We only ask for what we need to send you the receipt.
          </p>
        </div>

        <Field
          label="Full name"
          value={customer.name}
          onChange={(v) => onChange({ ...customer, name: v })}
          placeholder="Alex Kim"
          autoComplete="name"
        />
        <Field
          label="Work email"
          type="email"
          value={customer.email}
          onChange={(v) => onChange({ ...customer, email: v })}
          placeholder="alex@acme.com"
          autoComplete="email"
        />
        <Field
          label="Company"
          value={customer.company}
          onChange={(v) => onChange({ ...customer, company: v })}
          placeholder="Acme Inc."
          autoComplete="organization"
          optional
        />

        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={!canContinue}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Continue to payment →
          </button>
        </div>
      </form>

      <OrderSummary plan={plan} />
    </section>
  );
}

function Payment({
  plan,
  customer,
  cardName,
  cardNumber,
  cardExpiry,
  cardCvc,
  processing,
  canContinue,
  onChange,
  onBack,
  onSubmit,
}: {
  plan: Plan;
  customer: Customer;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  processing: boolean;
  canContinue: boolean;
  onChange: {
    setCardName: (v: string) => void;
    setCardNumber: (v: string) => void;
    setCardExpiry: (v: string) => void;
    setCardCvc: (v: string) => void;
  };
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <section className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Payment
          </h1>
          <p className="mt-2 text-slate-500">
            Stripe test mode — use <span className="font-mono">4242 4242 4242 4242</span>{" "}
            with any future expiry and any 3-digit CVC.
          </p>
        </div>

        <Field
          label="Name on card"
          value={cardName || customer.name}
          onChange={onChange.setCardName}
          placeholder="Alex Kim"
          autoComplete="cc-name"
        />
        <Field
          label="Card number"
          value={cardNumber}
          onChange={onChange.setCardNumber}
          placeholder="1234 1234 1234 1234"
          autoComplete="cc-number"
          mono
        />
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Expiry"
            value={cardExpiry}
            onChange={onChange.setCardExpiry}
            placeholder="MM / YY"
            autoComplete="cc-exp"
            mono
          />
          <Field
            label="CVC"
            value={cardCvc}
            onChange={onChange.setCardCvc}
            placeholder="123"
            autoComplete="cc-csc"
            mono
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={!canContinue || processing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            {processing ? (
              <>
                <Spinner /> Processing…
              </>
            ) : (
              <>Pay ${plan.price}.00</>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400">
          🔒 Your info is encrypted and never stored. Powered by Stripe.
        </p>
      </form>

      <OrderSummary plan={plan} />
    </section>
  );
}

function Success({
  plan,
  customer,
  onRestart,
}: {
  plan: Plan;
  customer: Customer;
  onRestart: () => void;
}) {
  return (
    <section className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg
          className="h-8 w-8 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          You're all set, {customer.name.split(" ")[0] || "there"}.
        </h1>
        <p className="mt-2 text-slate-500">
          Welcome to Solaris <span className="font-semibold">{plan.name}</span>. A
          receipt is on its way to{" "}
          <span className="font-medium text-slate-700">
            {customer.email || "your inbox"}
          </span>
          .
        </p>
      </div>
      <button
        type="button"
        onClick={onRestart}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Run the demo again
      </button>
    </section>
  );
}

function OrderSummary({ plan }: { plan: Plan }) {
  const tax = Math.round(plan.price * 0.09);
  const total = plan.price + tax;
  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Order summary
      </h2>
      <div className="mt-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="text-base font-semibold text-slate-900">
            Solaris {plan.name}
          </div>
          <div className="text-sm text-slate-500">Monthly subscription</div>
        </div>
        <div className="text-right text-base font-semibold text-slate-900">
          ${plan.price}.00
        </div>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-slate-500">
          <dt>Subtotal</dt>
          <dd>${plan.price}.00</dd>
        </div>
        <div className="flex justify-between text-slate-500">
          <dt>Tax (est.)</dt>
          <dd>${tax}.00</dd>
        </div>
        <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-base font-semibold text-slate-900">
          <dt>Total due today</dt>
          <dd>${total}.00</dd>
        </div>
      </dl>
    </aside>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  optional,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  optional?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {label}
        {optional && (
          <span className="text-xs font-normal text-slate-400">(optional)</span>
        )}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${
          mono ? "font-mono tracking-wide" : ""
        }`}
      />
    </label>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeWidth="3"
        className="opacity-20"
      />
      <path
        d="M22 12a10 10 0 01-10 10"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
