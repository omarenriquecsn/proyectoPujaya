"use client";

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { toast } from "react-toastify";
// import { IContactUsProps } from "../types/index";

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

export default function ContactUs() {
  const [status, setStatus] = useState("");
  // const [errors, setErrors] = useState<IContactUsProps>({
  //   name: "",
  //   email: "",
  //   message: "",
  // });

  const initialValues: ContactFormValues = {
    name: "",
    email: "",
    message: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required.")
      .min(3, "Name must be at least 3 characters long.")
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Name can only contain letters."),
    email: Yup.string()
      .required("Email is required.")
      .email("Invalid email address."),
    message: Yup.string()
      .required("Message is required.")
      .min(10, "Message must be at least 10 characters long.")
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Message can only contain letters."),
  });

  const handleSubmit = async (
    values: ContactFormValues,
    { resetForm, setSubmitting }: FormikHelpers<ContactFormValues>
  ) => {
    setStatus("Sending...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setStatus("Message sent successfully!");
        toast.success("Message sent successfully!");
        resetForm();
      } else {
        toast.error("Error sending the message.");
        setStatus("Error sending the message.");
      }
    } catch (error: unknown) {
      setStatus("Error sending the message.");
      console.log(error);
      toast.error("Error sending the message.");
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        setStatus("");
      }, 3000); // Clear status after 3 seconds
    }
  };

  return (
    <main className="flex flex-col items-center px-4 py-8 min-h-screen bg-blue-50">
      <h1 className="text-3xl font-bold mb-4 text-blue-900">Contact Us</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl space-y-4">
            <div>
              <label className="block text-blue-900 mb-1 font-medium" htmlFor="name">
                Name
              </label>
              <Field
                type="text"
                id="name"
                name="name"
                placeholder="Your name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div>
              <label className="block text-blue-900 mb-1 font-medium" htmlFor="email">
                Email
              </label>
              <Field
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div>
              <label className="block text-blue-900 mb-1 font-medium" htmlFor="message">
                Message
              </label>
              <Field
                as="textarea"
                id="message"
                name="message"
                rows={4}
                placeholder="Write your message here..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <ErrorMessage name="message" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-700 text-white py-2 rounded-xl font-semibold hover:bg-blue-800 transition"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>

            {status && <p className="text-center mt-2">{status}</p>}
          </Form>
        )}
      </Formik>
    </main>
  );
}
