import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log("Validated form payload:", values);
    reset();
  };

  return (
    <section className="mx-auto max-w-3xl px-4 pb-20 md:px-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Contact Sales</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-300">react-hook-form + zod with inline validation messages.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
          <input
            id="name"
            {...register("name")}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Jane Doe"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
          <input
            id="email"
            {...register("email")}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="you@company.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Message</label>
          <textarea
            id="message"
            {...register("message")}
            rows={4}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Tell us your expected monthly order volume..."
          />
          {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </section>
  );
}
