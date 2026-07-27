import React from 'react'
import { Pressable, Text } from 'react-native'

type Variant = 'default' | 'outline' | 'ghost'

export function Button({
  children, onPress, variant = 'default', className = '',
}: { children: React.ReactNode; onPress?: () => void; variant?: Variant; className?: string }) {
  const base = 'rounded-lg px-3 py-2 items-center justify-center flex-row'
  const variants: Record<Variant, string> = {
    default: 'bg-primary',
    outline: 'border border-border bg-transparent',
    ghost: 'bg-transparent',
  }
  const textVariants: Record<Variant, string> = {
    default: 'text-white font-medium text-sm',
    outline: 'text-foreground font-medium text-sm',
    ghost: 'text-muted-foreground font-medium text-sm',
  }

  return (
    <Pressable onPress={onPress} className={`${base} ${variants[variant]} ${className}`}>
      {typeof children === 'string'
        ? <Text className={textVariants[variant]}>{children}</Text>
        : children}
    </Pressable>
  )
}