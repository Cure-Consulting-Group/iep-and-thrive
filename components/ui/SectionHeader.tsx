interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  eyebrowClassName?: string
  titleClassName?: string
  subtitleClassName?: string
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  eyebrowClassName = '',
  titleClassName = '',
  subtitleClassName = '',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left'

  return (
    <div className={`mb-12 ${alignClass}`}>
      {eyebrow && (
        <p
          className={`eyebrow mb-3 ${eyebrowClassName}`}
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={`font-display ${titleClassName}`}>{title}</h2>
      {subtitle && (
        <p
          className={`mt-4 max-w-2xl text-base leading-relaxed text-warm-gray ${
            align === 'center' ? 'mx-auto' : ''
          } ${subtitleClassName}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
