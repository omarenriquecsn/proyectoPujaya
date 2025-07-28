'use client';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import Link from 'next/link';
import React from 'react';
import { validateLoginForm } from '../lib/validate';
import { login, loginWithGoogle } from '@/app/utils/auth.helper';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from "next/image";

const LoginComponent = () => {
  const { setUserData } = useAuth();
  const router = useRouter();

  // Ejemplo de llamada al login de Google
  const handleGoogleLogin = async () => {
    try {
      const authData = await loginWithGoogle();
      setUserData(authData);
      router.push('/');
      toast.success(`User ${authData.user.name} logged in with Google`, {
        position: 'top-center',
      });
    } catch (error) {
      toast.error('Google login has failed', {
        position: 'top-center',
      });
      console.error(error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 m-4">
        <h1 className="text-center text-3xl font-bold text-blue-900 mb-6">
          Welcome to <span className="text-yellow-400">PujaYa!</span>
        </h1>
        <Formik
          initialValues={{ email: '', password: '' }}
          validate={validateLoginForm}
          onSubmit={async (values) => {
            try {
              const response = await login(values);
              if (!response) {
                throw new Error('Bad Response');
              }
              const { token, user } = response;
              setUserData({ token, user });
              if (!user) {
                toast.error(`User not identified`);
              } else {
                const userValidated = user;
                toast.success(`User ${userValidated.name} logged in PujaYa!`, {
                  position: 'top-center',
                });
                setUserData({ token, user: userValidated });
                router.push('/');
              }
            } catch (error: unknown) {
              console.error(error);
              toast.error('Login has failed, verify your data')
            }
          }}
        >
          {({ isSubmitting, errors }) => (
            <Form className="space-y-4">
              <div>
                <label className="text-blue-900 font-medium">E-mail</label>
                <Field
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
              </div>
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
              <button
                type="submit"
                disabled={isSubmitting || errors.email || errors.password ? true : false}
                className="w-full bg-blue-700 text-white py-2 rounded-xl font-semibold shadow-md hover:bg-blue-800 transition disabled:opacity-50"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin} 
                className="w-full bg-white text-gray-800 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png"
                  alt="Google Logo"
                  className="h-5"
                  width={20}
                  height={50}
                />
                <span className="text-sm font-medium">Sign in with Google</span>
              </button>
              <p className="text-sm text-center text-gray-500">{`Don't have an account?`}</p>
              <Link href="/register" className="block">
                <button
                  type="button"
                  className="w-full bg-yellow-400 text-blue-900 py-2 rounded-xl font-semibold shadow-md hover:bg-yellow-500 transition"
                >
                  Register
                </button>
              </Link>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
};

export default LoginComponent;
