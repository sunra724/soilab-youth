interface BadgeProps {
  label: string;
  color?: 'navy' | 'blue' | 'green';
}

const STYLES = {
  navy:  { bg: '#ECEEF8', text: '#46549C' },
  blue:  { bg: '#E8F4FD', text: '#248DAC' },
  green: { bg: '#E6F4F1', text: '#228D7B' },
};

export default function Badge({ label, color = 'navy' }: BadgeProps) {
  const s = STYLES[color];
  return (
    <span
      className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.text }}
    >
      {label}
    </span>
  );
}
