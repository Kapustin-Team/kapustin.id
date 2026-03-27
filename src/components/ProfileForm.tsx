'use client';

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiPatch, apiUpload } from '@/lib/api';

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
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState(user.image || '');
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB

    // Show preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    const result = await apiUpload<{ url: string; user: User }>('/auth/upload/avatar', file);

    setUploading(false);

    if (result.data) {
      setPreviewUrl(result.data.url);
      onUpdate(result.data.user);
    } else {
      // Revert preview on failure
      setPreviewUrl(user.image || '');
    }

    // Cleanup object URL
    URL.revokeObjectURL(localPreview);

    // Reset file input
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    const result = await apiPatch<{ user: User }>('/auth/profile', {
      name: name || null,
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
    <div className="flex flex-col gap-6 w-full">
      <h2 className="text-[15px] font-semibold tracking-[-0.3px] text-[var(--fg)]">
        {dict.title}
      </h2>

      {/* Avatar upload */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer group shrink-0"
          disabled={uploading}
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={user.name || user.email}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center">
              <span className="text-[18px] font-medium text-[var(--fg-secondary)] select-none">
                {initials}
              </span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          {/* Uploading spinner */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </div>
          )}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-[var(--fg)] tracking-[-0.25px]">
            {dict.imageUrl}
          </span>
          <span className="text-[11px] text-[var(--fg-muted)] tracking-[-0.2px]">
            JPG, PNG, WebP · max 5 MB
          </span>
        </div>
      </div>

      {/* Name form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={dict.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
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
    </div>
  );
}
