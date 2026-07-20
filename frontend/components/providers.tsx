'use client';

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { ToastViewport } from '@/components/ui/toast';
import { apiGet } from '@/lib/api';
import type { User } from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';

function AuthBootstrap({ children }: { children: ReactNode }) {
 const hydrate = useAuthStore((state) => state.hydrate);
 const accessToken = useAuthStore((state) => state.accessToken);
 const setUser = useAuthStore((state) => state.setUser);

 useEffect(() => {
 hydrate();
 }, [hydrate]);

 useQuery({
 queryKey: ['auth-bootstrap', accessToken],
 enabled: Boolean(accessToken),
 queryFn: async () => {
 const user = await apiGet<User>('/users/me');
 setUser(user);
 return user;
 },
 retry: false,
 });

 return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
 const [client] = useState(
 () =>
 new QueryClient({
 defaultOptions: {
 queries: {
 staleTime: 30_000,
 retry: 1,
 refetchOnWindowFocus: false,
 },
 mutations: {
 retry: 0,
 },
 },
 }),
 );

 return (
 <QueryClientProvider client={client}>
 <AuthBootstrap>{children}</AuthBootstrap>
 <ToastViewport />
 </QueryClientProvider>
 );
}
