'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
  const router = useRouter();

  return (
    // Privacy Policy and Cookie Policy Arrow button
    <Button
      onClick={() => router.back()}
      className="mb-8 flex items-center text-white rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Go back
    </Button>
  );
};

export default BackButton;