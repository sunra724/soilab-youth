interface SectionHeadingProps {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
  inverse?: boolean;
}

export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  centered = false,
  inverse = false,
}: SectionHeadingProps) {
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p
        className={`text-xs font-bold tracking-[0.18em] ${inverse ? 'text-white/70' : 'text-navy'}`}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-3 text-2xl font-bold leading-tight sm:text-3xl ${inverse ? 'text-white' : 'text-gray-950'}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-sm leading-7 sm:text-base ${inverse ? 'text-white/75' : 'text-gray-600'}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
