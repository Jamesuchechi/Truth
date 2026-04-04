"use client";

import React, { useState, useRef } from "react";
import {
  updateSettings,
  deleteAccount,
  checkShadowNameAvailability,
  type ActionState,
} from "@/lib/actions/user";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Mail,
  Lock,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Globe,
  MessageSquareCode,
  Filter,
  Ban,
  Timer,
  ToggleLeft,
  Fingerprint,
  RefreshCw,
  Bell,
} from "lucide-react";
import { ToneType } from "@prisma/client";
import { generateShadowName, isProfane } from "@/lib/utils/shadow";
import TwoFactorSetup from "./TwoFactorSetup";
import Link from "next/link";
import { PushManager, type PushManagerHandle } from "../shared/PushManager";

interface ShadowUser {
  username?: string;
  email?: string;
  isTwoFactorEnabled?: boolean;
  bio?: string;
  image?: string;
  securityQuestion?: string;
  inboxEnabled?: boolean;
  allowAnonymousMsg?: boolean;
  questionsOnlyMode?: boolean;
  allowedTones?: string[];
  blockedPhrases?: string[];
  messageCooldown?: number;
  shadowName?: string;
  shadowBio?: string;
}

export default function SettingsForm() {
  const { data: session, update } = useSession();
  const user = session?.user as ShadowUser | undefined;

  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<ActionState>({});
  const pushManagerRef = useRef<PushManagerHandle>(null);
  const [pushStatus, setPushStatus] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    newPassword: "",
    isTwoFactorEnabled: user?.isTwoFactorEnabled || false,
    bio: user?.bio || "",
    image: user?.image || "",
    securityQuestion: user?.securityQuestion || "",
    securityAnswer: "",
    inboxEnabled: user?.inboxEnabled ?? true,
    allowAnonymousMsg: user?.allowAnonymousMsg ?? true,
    questionsOnlyMode: user?.questionsOnlyMode ?? false,
    allowedTones: (user?.allowedTones as ToneType[]) || [],
    blockedPhrases: (user?.blockedPhrases as string[])?.join(", ") || "",
    messageCooldown: user?.messageCooldown || 0,
    shadowName: user?.shadowName || "",
    shadowBio: user?.shadowBio || "",
  });

  const [shadowAvailability, setShadowAvailability] = useState<{
    checked: boolean;
    available: boolean;
    loading: boolean;
  }>({
    checked: false,
    available: true,
    loading: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setState({});

    try {
      const dataToSubmit = {
        ...formData,
        blockedPhrases: formData.blockedPhrases
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p !== ""),
        messageCooldown: Number(formData.messageCooldown),
      };
      const result = await updateSettings(dataToSubmit);
      setState(result);
      if (result.success) {
        await update(); // Refresh session
      }
    } catch {
      setState({ error: "Something went wrong" });
    } finally {
      setIsPending(false);
    }
  };

  const toggleTone = (tone: ToneType) => {
    const current = formData.allowedTones;
    if (current.includes(tone)) {
      setFormData({
        ...formData,
        allowedTones: current.filter((t) => t !== tone),
      });
    } else {
      setFormData({ ...formData, allowedTones: [...current, tone] });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    setIsPending(true);
    await deleteAccount();
  };

  return (
    <div className="animate-fadeIn w-full max-w-2xl space-y-8">
      {session?.user?.isAnonymous && (
        <div className="bg-truth-accentRed border-truth-accentRed border-2 p-8 shadow-[10px_10px_0px_rgba(255,51,102,0.2)]">
          <div className="flex items-start gap-4">
            <Shield className="text-truth-bg mt-1 h-10 w-10 shrink-0" />
            <div>
              <h3 className="font-bitter text-truth-bg mb-2 text-2xl font-black uppercase">
                Temporary Identity
              </h3>
              <p className="text-truth-bg/80 mb-6 font-mono text-sm leading-relaxed tracking-wide uppercase">
                You are currently operating in Shadow Mode. Your data is
                restricted to this session and may be lost.
              </p>
              <Link
                href="/signup"
                className="bg-truth-bg text-truth-accentRed inline-block px-6 py-3 font-mono text-xs font-bold uppercase shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all hover:bg-white active:translate-y-0.5 active:shadow-none"
              >
                Secure Your Account Protocol
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-truth-surface border-truth-surface-border border-2 p-8 shadow-[10px_10px_0px_rgba(255,51,102,0.1)]">
        <h3 className="font-bitter text-truth-on-surface mb-6 flex items-center gap-3 text-2xl font-black uppercase">
          Profile Configuration
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                Username
              </label>
              <div className="relative">
                <input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface focus:border-truth-accentRed w-full border-2 p-4 pl-4 font-mono outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="text-truth-textGray absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface focus:border-truth-accentRed w-full border-2 p-4 pl-12 font-mono outline-none"
                />
              </div>
            </div>
          </div>

          {!session?.user?.isAnonymous && (
            <div className="border-truth-surface-border space-y-6 border-t pt-6">
              <h4 className="text-truth-on-surface-muted mb-4 font-mono text-xs font-bold uppercase">
                Profile Metadata
              </h4>

              <div className="space-y-2">
                <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                  Bio / Designation
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={3}
                  placeholder="Transmit your purpose..."
                  className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface focus:border-truth-accentRed w-full resize-none border-2 p-4 font-mono outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                  Display Image URL
                </label>
                <div className="relative">
                  <Globe className="text-truth-on-surface-muted absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                  <input
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://reality.app/your-image.jpg"
                    className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface focus:border-truth-accentRed w-full border-2 p-4 pl-12 font-mono outline-none"
                  />
                </div>
              </div>

              {/* NEW: Shadow Identity Protocol */}
              <div className="border-truth-surface-border space-y-6 border-t pt-8">
                <div className="flex items-center gap-3">
                  <div className="bg-truth-accentPurple/20 flex h-8 w-8 items-center justify-center">
                    <Fingerprint className="text-truth-accentPurple h-4 w-4" />
                  </div>
                  <h4 className="font-bitter text-truth-on-surface text-xl font-black tracking-tight uppercase">
                    Shadow Identity Protocol
                  </h4>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                        Shadow Designation
                      </label>
                      <div className="relative">
                        <input
                          value={formData.shadowName}
                          onChange={async (e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, shadowName: val });
                            if (val.length >= 3) {
                              setShadowAvailability((prev) => ({
                                ...prev,
                                loading: true,
                              }));
                              const res =
                                await checkShadowNameAvailability(val);
                              setShadowAvailability({
                                checked: true,
                                available: !!res.available,
                                loading: false,
                              });
                            } else {
                              setShadowAvailability({
                                checked: false,
                                available: false,
                                loading: false,
                              });
                            }
                          }}
                          className={`bg-truth-surface-input text-truth-on-surface focus:border-truth-accentPurple w-full border-2 p-4 font-mono outline-none ${shadowAvailability.checked ? (shadowAvailability.available ? "border-truth-accentGreen" : "border-truth-accentRed") : "border-truth-surface-border"}`}
                          placeholder="Assign anonymous ID..."
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newName = generateShadowName();
                        setFormData({ ...formData, shadowName: newName });
                        setShadowAvailability({
                          checked: true,
                          available: true,
                          loading: false,
                        });
                      }}
                      className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface-muted hover:text-truth-accentPurple hover:border-truth-accentPurple border-2 p-4 transition-all"
                      title="Auto-Generate Shadow Designation"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                  {shadowAvailability.checked &&
                    !shadowAvailability.loading && (
                      <p
                        className={`font-mono text-[8px] uppercase ${shadowAvailability.available ? "text-truth-accentGreen" : "text-truth-accentRed"}`}
                      >
                        {shadowAvailability.available
                          ? "Identity Unique / Safe to Index"
                          : "Identity Conflict / Index Failed"}
                      </p>
                    )}
                  {formData.shadowName && isProfane(formData.shadowName) && (
                    <p className="text-truth-accentRed font-mono text-[8px] uppercase italic">
                      Identity Protocol Breach: Restricted Phrases Detected
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                    Anonymous Designation / Bio
                  </label>
                  <textarea
                    value={formData.shadowBio}
                    onChange={(e) =>
                      setFormData({ ...formData, shadowBio: e.target.value })
                    }
                    rows={2}
                    placeholder="Describe your shadow presence..."
                    className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface focus:border-truth-accentPurple w-full resize-none border-2 p-4 font-mono outline-none"
                  />
                  <p className="text-truth-on-surface-muted font-mono text-[8px] uppercase">
                    This will only be displayed when manifesting in Shadow Mode.
                  </p>
                </div>
              </div>

              {/* NEW: Privacy & Safety Section */}
              <div className="border-truth-surface-border space-y-8 border-t pt-8">
                <div className="flex items-center gap-3">
                  <div className="bg-truth-accentRed/20 flex h-8 w-8 items-center justify-center">
                    <Shield className="text-truth-accentRed h-4 w-4" />
                  </div>
                  <h4 className="font-bitter text-truth-on-surface text-xl font-black tracking-tight uppercase">
                    Privacy & Safety Configuration
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div
                    className={`group flex cursor-pointer items-center justify-between border-2 p-4 transition-all ${formData.inboxEnabled ? "border-truth-accentGreen bg-truth-accentGreen/5" : "border-truth-surface-border bg-truth-surface-nested"}`}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        inboxEnabled: !formData.inboxEnabled,
                      })
                    }
                  >
                    <div className="flex items-center gap-3">
                      <ToggleLeft
                        className={`h-5 w-5 transition-transform ${formData.inboxEnabled ? "text-truth-accentGreen" : "text-truth-on-surface-muted scale-x-[-1]"}`}
                      />
                      <div>
                        <p className="text-truth-on-surface font-mono text-[10px] font-black uppercase">
                          Inbox Status
                        </p>
                        <p className="text-truth-on-surface-muted font-mono text-[8px] uppercase">
                          {formData.inboxEnabled
                            ? "Online / Receiving"
                            : "Offline / Restricted"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`group flex cursor-pointer items-center justify-between border-2 p-4 transition-all ${formData.questionsOnlyMode ? "border-truth-accentBlue bg-truth-accentBlue/5" : "border-truth-surface-border bg-truth-surface-nested"}`}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        questionsOnlyMode: !formData.questionsOnlyMode,
                      })
                    }
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquareCode
                        className={`h-5 w-5 ${formData.questionsOnlyMode ? "text-truth-accentBlue" : "text-truth-on-surface-muted"}`}
                      />
                      <div>
                        <p className="text-truth-on-surface font-mono text-[10px] font-black uppercase">
                          Questions Only
                        </p>
                        <p className="text-truth-on-surface-muted font-mono text-[8px] uppercase">
                          {formData.questionsOnlyMode
                            ? "Enabled"
                            : "All Types Allowed"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`group flex cursor-pointer items-center justify-between border-2 p-4 transition-all ${pushStatus ? "border-truth-accentRed bg-truth-accentRed/5" : "border-truth-surface-border bg-truth-surface-nested"}`}
                    onClick={() => {
                      if (pushStatus) pushManagerRef.current?.unsubscribe();
                      else pushManagerRef.current?.subscribe();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Bell
                        className={`h-5 w-5 ${pushStatus ? "text-truth-accentRed translate-y-[-2px]" : "text-truth-on-surface-muted"}`}
                      />
                      <div>
                        <p className="text-truth-on-surface font-mono text-[10px] font-black uppercase">
                          Web Push Signals
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-truth-on-surface-muted font-mono text-[8px] uppercase">
                            {pushStatus
                              ? "Protocol Online"
                              : "Protocol Stalled"}
                          </p>
                          {pushStatus && (
                            <div className="bg-truth-accentRed h-1 w-1 animate-ping rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <PushManager
                  ref={pushManagerRef}
                  onStatusChange={setPushStatus}
                />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Filter className="text-truth-on-surface-muted h-3 w-3" />
                    <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                      Signal Tone Filtering (Allowed Transmissions)
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(ToneType).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => toggleTone(tone)}
                        className={`border px-3 py-2 font-mono text-[9px] uppercase transition-all duration-200 ${
                          formData.allowedTones.includes(tone)
                            ? "bg-truth-on-surface text-truth-surface border-truth-on-surface font-black"
                            : "border-truth-surface-border text-truth-on-surface-muted hover:border-truth-on-surface hover:text-truth-on-surface"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                    {formData.allowedTones.length === 0 && (
                      <span className="text-truth-accentYellow ml-2 self-center font-mono text-[8px] uppercase italic underline decoration-dotted">
                        Warning: No filter active (All tones accepted)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Ban className="text-truth-on-surface-muted h-3 w-3" />
                      <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                        Blocked Signal Patterns
                      </label>
                    </div>
                    <textarea
                      value={formData.blockedPhrases}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          blockedPhrases: e.target.value,
                        })
                      }
                      placeholder="Enter phrases separated by commas..."
                      className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface focus:border-truth-accentRed h-24 w-full resize-none border-2 p-4 font-mono text-[10px] outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Timer className="text-truth-on-surface-muted h-3 w-3" />
                      <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                        Transmission Cooldown (Minutes)
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        value={formData.messageCooldown}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            messageCooldown: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface focus:border-truth-accentRed w-full border-2 p-4 font-mono outline-none"
                      />
                      <div className="text-truth-on-surface-muted absolute top-1/2 right-4 -translate-y-1/2 font-mono text-[10px] uppercase">
                        MIN
                      </div>
                    </div>
                    <p className="text-truth-on-surface-muted font-mono text-[8px] leading-relaxed uppercase">
                      Required interval between successive signals from a single
                      source fingerprint.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-truth-surface-border border-t pt-8">
                <h4 className="text-truth-on-surface-muted mb-4 font-mono text-xs font-bold uppercase">
                  Account Recovery Protocol
                </h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                      Security Question
                    </label>
                    <select
                      value={formData.securityQuestion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          securityQuestion: e.target.value,
                        })
                      }
                      className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface focus:border-truth-accentRed w-full border-2 p-4 font-mono outline-none"
                    >
                      <option value="">Select Protocol</option>
                      <option value="maiden_name">
                        Originator&apos;s Maiden Name
                      </option>
                      <option value="first_pet">Initial Companion Name</option>
                      <option value="first_school">
                        Primary Learning Archive
                      </option>
                      <option value="city_born">Coordinate of Origin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                      Encrypted Answer
                    </label>
                    <input
                      type="password"
                      value={formData.securityAnswer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          securityAnswer: e.target.value,
                        })
                      }
                      placeholder="Assign recovery key"
                      className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface focus:border-truth-accentRed w-full border-2 p-4 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-truth-surface-border border-t pt-6">
                <h4 className="text-truth-on-surface-muted mb-4 font-mono text-xs font-bold uppercase">
                  Security Protocol Update
                </h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                      Current Key
                    </label>
                    <div className="relative">
                      <Lock className="text-truth-textGray absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Confirm current key"
                        className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface focus:border-truth-accentRed w-full border-2 p-4 pl-12 font-mono outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-truth-on-surface-muted block font-mono text-[10px] tracking-widest uppercase">
                      New Key
                    </label>
                    <div className="relative">
                      <Shield className="text-truth-textGray absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Assign new key"
                        className="bg-truth-surface-input border-truth-surface-border text-truth-on-surface focus:border-truth-accentRed w-full border-2 p-4 pl-12 font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state.error && (
            <div className="bg-truth-accentRed/10 border-truth-accentRed text-truth-accentRed flex items-center gap-2 border p-4 font-mono text-xs">
              <AlertCircle className="h-4 w-4" />{" "}
              {typeof state.error === "string" ? state.error : "Update failed"}
            </div>
          )}

          {state.success && (
            <div className="bg-truth-accentGreen/10 border-truth-accentGreen text-truth-accentGreen flex items-center gap-2 border p-4 font-mono text-xs">
              <CheckCircle2 className="h-4 w-4" /> {state.success}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-truth-textLight text-truth-bg flex w-full items-center justify-center gap-2 py-4 font-mono font-bold tracking-widest uppercase transition-colors hover:bg-white disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Commit Profile Changes"
            )}
          </button>
        </form>
      </div>

      <TwoFactorSetup />

      <div className="bg-truth-accentRed/10 border-truth-accentRed/40 border-2 p-8">
        <h3 className="font-bitter text-truth-accentRed mb-2 flex items-center gap-3 text-2xl font-black uppercase">
          <Trash2 className="h-6 w-6" /> Danger Zone
        </h3>
        <p className="text-truth-textGray mb-6 font-mono text-xs tracking-wider uppercase">
          Permanent identity deletion from the network
        </p>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="border-truth-accentRed text-truth-accentRed hover:bg-truth-accentRed hover:text-truth-bg flex items-center gap-2 border-2 px-6 py-3 font-mono text-xs font-bold uppercase transition-all disabled:opacity-50"
        >
          Terminate Account Protocol
        </button>
      </div>
    </div>
  );
}
