'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Vote } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiGet, apiPost } from '@/lib/api';

type PollProject = {
  id: string;
  title: string;
  description: string;
  cover?: string | null;
  _count: {
    votes: number;
  };
};

export function PollsPage() {
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => apiGet<PollProject[]>('/polls'),
  });

  const voteMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/polls/${id}/vote`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black">انتخاب پروژه ترجمه بعدی</h1>
          <p className="mt-3 text-white/50">
            به پروژه مورد علاقه‌ات رأی بده تا تیم ترجمه بدونه سراغ چی بره.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {data.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="h-48 bg-black">
                  {project.cover ? (
                    <img src={project.cover} alt={project.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-black">{project.title}</h2>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/55">
                    {project.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm text-white/50">{project._count.votes} رأی</span>
                    <Button
                      size="sm"
                      disabled={voteMutation.isPending}
                      onClick={() => voteMutation.mutate(project.id)}
                    >
                      <Vote size={16} />
                      <span className="mr-2">رأی می‌دم</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
