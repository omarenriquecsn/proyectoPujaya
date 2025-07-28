'use client';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { validateRegisterForm } from '../lib/validate';
import Link from 'next/link';
import { register } from '@/app/utils/auth.helper';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/app/context/AuthContext';
import { getIdToken } from 'firebase/auth';

const RegisterComponent = () => {
  const [registerError, setRegisterError] = useState<string | null>(null);
  const router = useRouter();
  const { setUserData } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 m-4">
        <h1 className="text-center text-3xl font-bold text-blue-800 mb-2">
          Create an account in <span className="text-yellow-400">PujaYa!</span>
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Register to bid in the best Actions online.
        </p>
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            address: '',
            country: '',
          }}
          validate={validateRegisterForm}
          onSubmit={async (values, { setSubmitting }) => {
            setRegisterError(null);
            try {
              const response = await register(values);

              const updatedUser = {
                token: response.user ? await getIdToken(response.user) : '',
                user: {
                  ...response.backendData,
                },
              };

              setUserData(updatedUser);

              toast.success(`User registered succesfully`, {
                position: "top-center"
              })
              router.push("/");
            } catch (error: unknown) {
              setRegisterError((error as Error).message || "Registration failed");
              toast.error(`User register has failed`, {
                position: 'top-center',
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, errors }) => (
            <Form className="space-y-4">
              {registerError && (
                <div className="text-red-500 text-sm text-center">{registerError}</div>
              )}
              {/* Name */}
              <div>
                <label className="text-blue-900 font-medium">Name</label>
                <Field
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  type="text"
                  name="name"
                  placeholder="Your name"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>
              {/* Email */}
              <div>
                <label className="text-blue-900 font-medium">E-mail</label>
                <Field
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  type="email"
                  name="email"
                  placeholder="mail@example.com"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
              </div>
              {/* Password */}
              <div>
                <label className="text-blue-900 font-medium">Password</label>
                <Field
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  type="password"
                  name="password"
                  placeholder="********"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
              </div>
              {/* Confirm Password */}
              <div>
                <label className="text-blue-900 font-medium">Confirmar Contraseña</label>
                <Field
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  type="password"
                  name="confirmPassword"
                  placeholder="********"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              {/* Address */}
              <div>
                <label className="text-blue-900 font-medium">Address</label>
                <Field
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  type="text"
                  name="address"
                  placeholder="Your address"
                />
                <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
              </div>
              {/* Country */}
              <div>
                <label className="text-blue-900 font-medium">Country</label>
                <Field
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  type="text"
                  name="country"
                  placeholder="e.g. Argentina"
                />
                <ErrorMessage name="country" component="div" className="text-red-500 text-sm" />
              </div>
              {/* Phone */}
              <div>
                <label className="text-blue-900 font-medium">Phone Number</label>
                <Field
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  type="text"
                  name="phone"
                  placeholder="e.g. 1123456789"
                />
                <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
              </div>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  errors.name ||
                  errors.email ||
                  errors.password ||
                  errors.address ||
                  errors.phone
                    ? true
                    : false
                }
                className="w-full bg-yellow-400 text-blue-900 font-semibold py-2 rounded-xl shadow-md hover:bg-yellow-500 transition disabled:opacity-50"
              >
                Register
              </button>
              <p className="text-sm text-center text-gray-500">Do you already have an account?</p>
              <Link href="/login" className="block">
                <button
                  type="button"
                  className="w-full bg-blue-800 text-white py-2 rounded-xl shadow-md hover:bg-blue-900 transition"
                >
                  LogIn
                </button>
              </Link>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RegisterComponent;