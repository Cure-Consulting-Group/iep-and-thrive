type BadgeVariant = 'sage' | 'forest' | 'amber' | 'white'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  sage: 'bg-sage-pale text-forest',
  forest: 'bg-forest text-white',
  amber: 'bg-amber-light text-amber',
  white: 'bg-white/15 text-sage',
}

export default function Badge({
  children,
  variant = 'sage',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold font-body ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
