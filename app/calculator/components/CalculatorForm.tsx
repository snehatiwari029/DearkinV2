"use client";

import { useState } from "react";
import { ClaimInput } from "@/lib/pfml/types";
import { EMPLOYER_OPTIONS } from "@/lib/pfml/employers";

interface CalculatorFormProps {
  onCalculate: (input: ClaimInput) => void;
  isLoading?: boolean;
}

export default function CalculatorForm({ onCalculate, isLoading }: CalculatorFormProps) {
  const [form, setForm] = useState({
    annualSalary: "",
    leaveStartDate: "",
    employer: "none",
    leaveType: "combined" as ClaimInput["leaveType"],
    hasComplications: false,
    hoursWorked: "1000",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCalculate({
      annualSalary: parseFloat(form.annualSalary),
      leaveStartDate: form.leaveStartDate,
      employer: form.employer,
      leaveType: form.leaveType,
      hasComplications: form.hasComplications,
      hoursWorked: parseInt(form.hoursWorked, 10),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Annual Salary
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mid font-medium">$</span>
          <input
            type="number"
            required
            min={1}
            max={1000000}
            placeholder="120,000"
            value={form.annualSalary}
            onChange={(e) => setForm({ ...form, annualSalary: e.target.value })}
            className="w-full pl-7 pr-4 py-3 border border-cream-dark rounded-input bg-white text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
          />
        </div>
        <p className="text-xs text-ink-light mt-1">Your gross annual salary (not hourly rate)</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Expected Leave Start Date
        </label>
        <input
          type="date"
          required
          value={form.leaveStartDate}
          onChange={(e) => setForm({ ...form, leaveStartDate: e.target.value })}
          className="w-full px-4 py-3 border border-cream-dark rounded-input bg-white text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Employer
        </label>
        <select
          value={form.employer}
          onChange={(e) => setForm({ ...form, employer: e.target.value })}
          className="w-full px-4 py-3 border border-cream-dark rounded-input bg-white text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
        >
          {EMPLOYER_OPTIONS.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <p className="text-xs text-ink-light mt-1">
          Policies change — verify with HR
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Leave Type
        </label>
        <div className="space-y-2">
          {[
            { value: "combined", label: "Medical + Bonding (most common)", desc: "Pregnancy disability leave followed by bonding time" },
            { value: "bonding", label: "Bonding Only", desc: "Paternity leave or adoption" },
            { value: "medical", label: "Medical Only", desc: "Pregnancy disability or other medical leave" },
          ].map(({ value, label, desc }) => (
            <label
              key={value}
              className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition-colors ${
                form.leaveType === value
                  ? "border-terracotta bg-terracotta-light"
                  : "border-cream-dark bg-white hover:bg-cream"
              }`}
            >
              <input
                type="radio"
                name="leaveType"
                value={value}
                checked={form.leaveType === value}
                onChange={() => setForm({ ...form, leaveType: value as ClaimInput["leaveType"] })}
                className="mt-0.5 accent-terracotta"
              />
              <div>
                <div className="text-sm font-medium text-ink">{label}</div>
                <div className="text-xs text-ink-mid">{desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hasComplications}
            onChange={(e) => setForm({ ...form, hasComplications: e.target.checked })}
            className="mt-0.5 accent-terracotta w-4 h-4"
          />
          <div>
            <span className="text-sm font-semibold text-ink">Pregnancy Complications</span>
            <p className="text-xs text-ink-mid mt-0.5">
              Adds 2 extra weeks to medical leave (up to 14 weeks medical, 18 weeks combined)
            </p>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-1.5">
          Hours Worked in Past 12 Months
        </label>
        <input
          type="number"
          required
          min={0}
          max={3000}
          placeholder="1000"
          value={form.hoursWorked}
          onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
          className="w-full px-4 py-3 border border-cream-dark rounded-input bg-white text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
        />
        <p className="text-xs text-ink-light mt-1">
          Must be 820+ hours to qualify for WA PFML
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-terracotta hover:bg-terracotta-dark text-white font-semibold rounded-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Calculating…" : "Calculate My Leave Income"}
      </button>
    </form>
  );
}
