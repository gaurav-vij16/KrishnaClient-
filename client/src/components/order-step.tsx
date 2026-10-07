type Props = {
  number: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function OrderStep({
  number,
  title,
  description,
  children,
  className = '',
}: Props) {
  return (
    <section
      className={
        'min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 ' +
        className
      }
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-extrabold text-amber-900">
          {number}
        </span>
        <div className="pt-0.5">
          <h2 className="text-lg font-bold leading-tight text-stone-900">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-stone-500">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
