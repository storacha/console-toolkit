import React, { type ReactNode } from 'react'
import { StorachaAuth } from '@storacha/console-toolkit-react'

export function AuthSection({ children }: { children: ReactNode }) {
  return (
    <StorachaAuth>
      <StorachaAuth.Ensurer
        renderLoader={(type) => (
          <div className="app-auth-loader">
            <div className="app-spinner"></div>
            <h3>{type === 'initializing' ? 'Initializing...' : 'Authenticating...'}</h3>
          </div>
        )}
        renderForm={() => (
          <div className="app-auth-container">
            <StorachaAuth.Form
              renderContainer={(children) => (
                <div className="app-auth-form-wrapper">
                  {children}
                </div>
              )}
              renderLogo={() => (
                <div className="app-auth-logo-container">
                  <div className="app-auth-logo-placeholder">S</div>
                  <h1 className="app-auth-title">Welcome to Your Storage</h1>
                  <p className="app-auth-subtitle">Sign in to manage your decentralized spaces and files</p>
                </div>
              )}
              renderEmailLabel={() => (
                <label className="app-auth-label" htmlFor="storacha-auth-email">
                  Email
                </label>
              )}
              renderEmailInput={() => (
                <StorachaAuth.EmailInput
                  id="storacha-auth-email"
                  className="app-auth-email-input"
                  required
                />
              )}
              renderSubmitButton={(disabled) => (
                <button
                  type="submit"
                  className={`app-auth-submit-button ${disabled ? 'loading' : ''}`}
                  disabled={disabled}
                >
                  {disabled ? (
                    <>
                      <span className="app-spinner"></span>
                      Authorizing...
                    </>
                  ) : (
                    'Authorize'
                  )}
                </button>
              )}
            />
          </div>
        )}
        renderSubmitted={() => (
          <div className="app-auth-container">
            <StorachaAuth.Submitted
              renderContainer={(children) => (
                <div className="app-auth-form-wrapper">
                  {children}
                </div>
              )}
              renderLogo={() => (
                <div className="app-auth-logo-container">
                  <div className="app-auth-logo-placeholder">S</div>
                  <h1 className="app-auth-title">Welcome to Your Storage</h1>
                </div>
              )}
              renderTitle={() => (
                <h2 className="app-auth-submitted-title">Verify your email address!</h2>
              )}
              renderMessage={(email) => (
                <p className="app-auth-submitted-message">
                  Click the link in the email we sent to{' '}
                  <span className="app-auth-submitted-email">{email}</span> to authorize this agent.
                  <br />
                  Don&apos;t forget to check your spam folder!
                </p>
              )}
              renderCancelButton={() => (
                <StorachaAuth.CancelButton className="app-auth-cancel-button">
                  Cancel
                </StorachaAuth.CancelButton>
              )}
            />
          </div>
        )}
      >
        {children}
      </StorachaAuth.Ensurer>
    </StorachaAuth>
  )
}
