import React, { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
const feeOptions = {
  "Tuition Fee": 100000,
  "Exam Fee": 2000,
  "Registration Fee": 1000,
  "Pay Fine": 500,
  "Condonation Fee": 1000,
  "Coursera / Udemy Fee": 5000,
  "Event Registration": 1000,
};

const Fee = () => {
  const [form, setForm] = useState({
    year: "",
    paymentFor: "",
    amount: "",
    phone: "",
    email: "",
    bank: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Mobile number: only digits & max 10
    if (name === "phone" && !/^\d{0,10}$/.test(value)) return;

    setForm({ ...form, [name]: value });
  };

  const handlePaymentSelect = (e) => {
    const selected = e.target.value;
    setForm({
      ...form,
      paymentFor: selected,
      amount: feeOptions[selected],
    });
  };

  const validate = () => {
    const err = {};
    if (!form.year) err.year = "Select year";
    if (!form.paymentFor) err.paymentFor = "Select payment type";
    if (!/^\d{10}$/.test(form.phone)) err.phone = "Enter 10 digit number";
    if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Invalid email";
    if (!form.bank) err.bank = "Select bank";
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setErrors({});
    alert("Payment Initiated 🚀");
  };

  return (
<div className="min-h-screen bg-white flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-xl space-y-5"
      >
        <h2 className="text-2xl font-bold text-indigo-600">
          Fee Payment
        </h2>

        {/* Year */}
        <Select
          label="Year of Study"
          name="year"
          value={form.year}
          onChange={handleChange}
          options={["1", "2", "3", "4"]}
          error={errors.year}
        />

        {/* Payment For */}
        <Select
          label="Payment For"
          name="paymentFor"
          value={form.paymentFor}
          onChange={handlePaymentSelect}
          options={Object.keys(feeOptions)}
          error={errors.paymentFor}
        />

        {/* Amount (Auto) */}
        <Input
          label="Amount (INR)"
          value={form.amount}
          disabled
        />

        {/* Phone */}
        <Input
          label="Mobile Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="10 digit number"
        />

        {/* Email */}
        <Input
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        {/* Bank */}
        <Select
          label="Bank"
          name="bank"
          value={form.bank}
          onChange={handleChange}
          options={["SBI", "ICICI", "AXIS"]}
          error={errors.bank}
        />

       <button
  type="submit"
  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition"
>
  Pay ₹{form.amount || 0}
</button>

      </form>
    </div>
  );
};

export default Fee;

/* ---------- Components ---------- */

const Input = ({ label, error, ...props }) => (
  <div>
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <input
      {...props}
      className={`w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none
      ${error ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-indigo-300"}`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Select = ({ label, options, error, ...props }) => (
  <div>
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <select
      {...props}
      className={`w-full mt-1 px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none
      ${error ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-indigo-300"}`}
    >
      <option value="">Select</option>
      {options.map((op) => (
        <option key={op} value={op}>
          {op}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);
