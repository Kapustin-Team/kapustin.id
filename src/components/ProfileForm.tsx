'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiPatch } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface ProfileDict {
  title: string;
  name: string;
  imageUrl: string;
  save: string;
  saved: string;
  error: string;
}

interface ProfileFormProps {
  user: User;
  dict: ProfileDict;
  onUpdate: (user: User) => void;
}

export function ProfileForm({ user, dict, onUpdate }: ProfileFormProps) {
  const [name, setName] = useState(user.name || '');
  const [image, setImage] = useState(user.image || '');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    const result = await apiPatch<{ user: User }>('/auth/profile', {
      name: name || null,
      image: image || null,
    });

    setLoading(false);

    if (result.data?.user) {
      setStatus('saved');
      onUpdate(result.data.user);
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <h2 className="text-[15px] font-semibold tracking-[-0.3px] text-[var(--fg)]">
        {dict.title}
      </h2>
      <Input
        label={dict.name}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
      />
      <Input
        label={dict.imageUrl}
        value={image}
        onChange={(e) => setImage(e.target.value)}
        placeholder="https://example.com/avatar.png"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" loading={loading}>
          {dict.save}
        </Button>
        {status === 'saved' && (
          <span className="text-[13px] tracking-[-0.25px] text-[var(--color-success,#22c55e)]">
            {dict.saved}
          </span>
        )}
        {status === 'error' && (
          <span className="text-[13px] tracking-[-0.25px] text-[var(--color-error)]">
            {dict.error}
          </span>
        )}
      </div>
    </form>
  );
}
