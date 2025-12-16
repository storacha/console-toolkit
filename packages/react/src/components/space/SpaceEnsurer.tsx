import type { ReactNode } from 'react'

import React, { useMemo } from 'react'
import { useW3 } from '../../providers/Provider.js'
import { SpaceCreator } from './SpaceCreator.js'

export interface SpaceEnsurerProps {
  children: ReactNode
  /**
   * Render prop for no spaces state
   */
  renderNoSpaces?: () => ReactNode
  /**
   * Render prop for space creator
   */
  renderCreator?: () => ReactNode
}

/**
 * SpaceEnsurer ensures that at least one space exists.
 * If no spaces exist, it shows the space creator.
 * If spaces exist, it renders children.
 */
export const SpaceEnsurer = ({ 
  children, 
  renderNoSpaces,
  renderCreator,
}: SpaceEnsurerProps) => {
  const [{ spaces, accounts }] = useW3()

  const hasSpaces = useMemo(() => spaces && spaces.length > 0, [spaces])

  if (hasSpaces) {
    return <>{children}</>
  }

  if (renderNoSpaces) {
    return <>{renderNoSpaces()}</>
  }

  if (renderCreator) {
    return <>{renderCreator()}</>
  }

  // Default: show space creator
  return (
    <div>
      <h2>Welcome{accounts[0] ? ` ${accounts[0]?.toEmail()}` : ''}!</h2>
      <p>To get started, create a space.</p>
      <SpaceCreator>
        <SpaceCreator.Form />
      </SpaceCreator>
    </div>
  )
}

