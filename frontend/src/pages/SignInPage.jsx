// SignInPage – Clerk hosted sign-in component
import React from 'react'
import { SignIn } from '@clerk/clerk-react'

export function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-black text-3xl text-slate-900 dark:text-white">Welcome Back 👋</h1>
          <p className="text-slate-600 mt-2">Sign in to your FundHope account</p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          appearance={{
            elements: {
              card: 'shadow-none border border-slate-200 dark:border-slate-700 rounded-2xl',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border border-slate-200 dark:border-slate-700 rounded-xl w-full',
              formButtonPrimary: 'bg-brand-500 hover:bg-brand-600 rounded-xl',
              formFieldInput: 'rounded-xl border-slate-200',
            }
          }}
        />
      </div>
    </div>
  )
}
export default SignInPage
