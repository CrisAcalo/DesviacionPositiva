import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

type FlashProps = {
    flash?: {
        toast?: FlashToast;
    };
};

export function useFlashToast(): void {
    const { flash } = usePage<FlashProps>().props;
    const lastMessage = useRef<string | null>(null);

    useEffect(() => {
        const data = flash?.toast;
        if (!data?.message) return;

        const key = `${data.type}:${data.message}`;
        if (lastMessage.current === key) return;

        lastMessage.current = key;
        toast[data.type](data.message);
    }, [flash?.toast]);
}
