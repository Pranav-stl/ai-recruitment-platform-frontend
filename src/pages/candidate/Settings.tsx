import { useState } from "react";
import {
  User,
  Bell,
  Palette,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import { cn } from "../../lib/utils";

interface NotificationPrefs {
  jobMatchAlerts: boolean;
  applicationUpdates: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

interface PrivacyPrefs {
  profileVisibleToRecruiters: boolean;
  showContactInfo: boolean;
  shareDataForMatching: boolean;
}

type ThemeOption = "light" | "dark" | "system";

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export default function Settings() {
  const [name, setName] = useState("Dar");
  const [email, setEmail] = useState("dar.dev@example.com");

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    jobMatchAlerts: true,
    applicationUpdates: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  const [privacy, setPrivacy] = useState<PrivacyPrefs>({
    profileVisibleToRecruiters: true,
    showContactInfo: false,
    shareDataForMatching: true,
  });

  const [theme, setTheme] = useState<ThemeOption>("system");
  const [saved, setSaved] = useState(false);

  function toggleNotification(key: keyof NotificationPrefs) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  }

  function togglePrivacy(key: keyof PrivacyPrefs) {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  }

  function handleSave() {
    // Mock only — no API call. Wire this up to your backend later.
    setSaved(true);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, notifications, appearance, and privacy preferences.
        </p>
      </div>

      {/* Account Settings */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Account Settings</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-name">Full Name</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-email">Email Address</Label>
            <Input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-password">New Password</Label>
            <Input id="settings-password" type="password" placeholder="••••••••" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-password-confirm">Confirm Password</Label>
            <Input id="settings-password-confirm" type="password" placeholder="••••••••" />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Notification Preferences</h2>
        </div>

        <div className="mt-4 flex flex-col divide-y divide-border">
          <SettingRow
            label="Job match alerts"
            description="Get notified when a new role matches your profile."
            checked={notifications.jobMatchAlerts}
            onCheckedChange={() => toggleNotification("jobMatchAlerts")}
          />
          <SettingRow
            label="Application updates"
            description="Status changes on jobs you've applied to."
            checked={notifications.applicationUpdates}
            onCheckedChange={() => toggleNotification("applicationUpdates")}
          />
          <SettingRow
            label="Weekly digest"
            description="A weekly summary of new matches and activity."
            checked={notifications.weeklyDigest}
            onCheckedChange={() => toggleNotification("weeklyDigest")}
          />
          <SettingRow
            label="Marketing emails"
            description="Product updates, tips, and occasional offers."
            checked={notifications.marketingEmails}
            onCheckedChange={() => toggleNotification("marketingEmails")}
          />
        </div>
      </div>

      {/* Theme placeholder */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Appearance</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Placeholder only — connect this to your theme provider to make it functional.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTheme(value);
                setSaved(false);
              }}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
                theme === value
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Privacy Settings</h2>
        </div>

        <div className="mt-4 flex flex-col divide-y divide-border">
          <SettingRow
            label="Visible to recruiters"
            description="Allow recruiters to find your profile in search."
            checked={privacy.profileVisibleToRecruiters}
            onCheckedChange={() => togglePrivacy("profileVisibleToRecruiters")}
          />
          <SettingRow
            label="Show contact info"
            description="Display your email and phone on your public profile."
            checked={privacy.showContactInfo}
            onCheckedChange={() => togglePrivacy("showContactInfo")}
          />
          <SettingRow
            label="Share data for AI matching"
            description="Let the AI match engine use your resume and activity to improve matches."
            checked={privacy.shareDataForMatching}
            onCheckedChange={() => togglePrivacy("shareDataForMatching")}
          />
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Your changes have been saved (mock).
        </div>
      )}

      <div className="flex justify-end border-t border-border pt-5">
        <Button className="gap-1.5" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

interface SettingRowProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: () => void;
}

function SettingRow({ label, description, checked, onCheckedChange }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}