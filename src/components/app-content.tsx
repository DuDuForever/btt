
"use client"

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from '@/components/app-shell';
import { Skeleton } from './ui/skeleton';
import { RoleSelector } from './role-selector';

const publicPaths = ['/login', '/premium', '/premium/request'];

function FullPageLoader() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-6 w-48" />
            </div>
        </div>
    )
}

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, role } = useAuth();
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  const [initialLoad, setInitialLoad] = React.useState(true);

  React.useEffect(() => {
    if (!loading) {
      if (initialLoad) {
        setInitialLoad(false);
      }
      
      const defaultOwnerPath = '/dashboard';
      const defaultAssistantPath = '/';

      if (!user && !isPublicPath) {
        router.replace('/login');
      } else if (user && isPublicPath) {
        // If user is logged in and on a public path, redirect appropriately
        const targetPath = role === 'owner' ? defaultOwnerPath : defaultAssistantPath;
        router.replace(targetPath);
      } else if (user && !role && !isPublicPath) {
        // Logged in but no role selected, stay put for RoleSelector
      } else if (user && role && (pathname === '/login' || pathname.startsWith('/premium'))) {
        // After login/role selection, move to correct default page
         const targetPath = role === 'owner' ? defaultOwnerPath : defaultAssistantPath;
         router.replace(targetPath);
      }
    }
  }, [user, loading, isPublicPath, router, pathname, role, initialLoad]);
  
  // Show loader during auth state check or initial routing decisions
  if (loading || initialLoad || (!user && !isPublicPath)) {
    return <FullPageLoader />;
  }
  
  // If user is logged in but has not selected a role yet, show selector
  if (user && !role && !isPublicPath) {
    return <RoleSelector />;
  }

  // If user is logged in and on a public path, show loader while redirecting
  if (user && isPublicPath) {
    return <FullPageLoader />;
  }

  // If on a public path (and not logged in), just show the page
  if (isPublicPath) {
    return <>{children}</>;
  }

  // If logged in with a role, show the main app shell
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppShell>{children}</AppShell>
    </ThemeProvider>
  );
}
