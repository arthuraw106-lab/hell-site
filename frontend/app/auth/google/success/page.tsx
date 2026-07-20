import { GoogleSuccessClient } from '@/components/auth/google-success-client';
import { Card } from '@/components/ui/card';

export const metadata = {
 title: 'تکمیل ورود Google',
};

export const dynamic = 'force-dynamic';

export default function GoogleSuccessPage() {
 return (
 <main className="grid min-h-screen place-items-center bg-hell-bg p-6 text-white">
 <Card className="w-full max-w-md p-6 text-center">
 <GoogleSuccessClient />
 </Card>
 </main>
 );
}
