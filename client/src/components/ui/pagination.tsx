import { Button } from './button';
export function Pagination({
  page,
  limit,
  total,
  onPageChange,
}: {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 px-4 py-3">
      <p className="text-sm text-stone-600">
        {total
          ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`
          : '0 orders'}
      </p>
      <div className="flex gap-2">
        <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
