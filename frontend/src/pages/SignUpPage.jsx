import React from 'react'
import { SignUp } from '@clerk/clerk-react'

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-black text-3xl text-slate-900 dark:text-white">Join FundHope 🌱</h1>
          <p className="text-slate-600 mt-2">Create your account and start making a difference</p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/"
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
