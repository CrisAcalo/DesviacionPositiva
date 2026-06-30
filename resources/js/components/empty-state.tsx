import { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border-2 border-dashed border-border bg-muted/20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Icon className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
                {description}
            </p>
            {action && <div>{action}</div>}
        </div>
    );
}
