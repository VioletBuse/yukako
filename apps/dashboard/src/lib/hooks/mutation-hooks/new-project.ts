import { useListProjects } from '@/lib/hooks/data-hooks/list-projects';
import { useAuthToken, useServerUrl } from '@/lib/hooks/wrapper';
import { Wrapper } from '@yukako/wrapper';
import { useState } from 'react';
import { toast } from 'sonner';

export const useNewProjectMutation = () => {
    const [, , , mutate] = useListProjects();
    const [loading, setLoading] = useState(false);

    const server = useServerUrl();
    const authToken = useAuthToken();

    const newProjectFXN = async (data: { name: string }) => {
        setLoading(true);
        const res = await Wrapper(server, authToken ?? '').projects.create(
            data.name,
        );
        setLoading(false);

        if (res[0]) {
            mutate();
            toast.success('Project created successfully');
        }

        return res;
    };

    return [newProjectFXN, loading] as const;
};
