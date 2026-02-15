"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Check, X } from "lucide-react";
import { updateProfile } from "@/app/actions";
import { useRouter } from "next/navigation";

interface ProfileEditorProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ProfileEditor({ user }: ProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(user.image || null);
  const [name, setName] = useState(user.name || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 250 * 1024) { // 250KB limit for DynamoDB
        alert("File size too large. Please keep it under 250KB for profile storage.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.email) return;

    setIsUpdating(true);
    try {
      const result = await updateProfile(user.email, {
        name,
        image: previewImage || undefined,
      });

      if (result.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse" />
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-yellow-500 p-1 bg-[#0a0a0a]">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-yellow-500/10 flex items-center justify-center rounded-full">
                <Camera className="w-16 h-16 text-yellow-500" />
              </div>
            )}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          {user.name}
        </h1>
        <p className="text-lg text-white/60 font-medium mb-4">
          {user.email}
        </p>

        <button
          onClick={() => setIsEditing(true)}
          className="px-6 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-500 text-sm font-bold rounded-xl transition-all"
        >
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full mt-4 space-y-6">
      <div className="flex flex-col items-center">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-yellow-500 p-1 bg-[#0a0a0a] overflow-hidden">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center rounded-full">
                <Camera className="w-12 h-12 text-white/20" />
              </div>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <p className="text-[10px] text-white/40 mt-3 uppercase font-bold tracking-widest">Click to change photo (Max 250KB)</p>
      </div>

      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-white/40">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setPreviewImage(user.image || null);
            setName(user.name || "");
          }}
          disabled={isUpdating}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isUpdating}
          className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
