export function PageHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-7 w-7 text-primary" />}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {description && <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
