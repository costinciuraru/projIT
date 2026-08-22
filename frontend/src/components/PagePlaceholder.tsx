interface PagePlaceholderProps {
  title: string;
}

function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-3xl bg-white px-12 py-10 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      </div>
    </div>
  );
}

export default PagePlaceholder;
