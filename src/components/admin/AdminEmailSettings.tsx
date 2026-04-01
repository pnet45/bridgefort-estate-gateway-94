import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Mail, Filter, Maximize2, ListFilter, Bell, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EmailSettingsProps {
  onSettingsChange?: (settings: EmailSettings) => void;
}

export interface EmailSettings {
  emailsPerPage: number;
  autoRefreshInterval: number;
  showPreviewPane: boolean;
  defaultFolder: string;
  notifyNewEmails: boolean;
  compactView: boolean;
  filterUnreadFirst: boolean;
  groupByThread: boolean;
}

const DEFAULT_SETTINGS: EmailSettings = {
  emailsPerPage: 25,
  autoRefreshInterval: 0,
  showPreviewPane: true,
  defaultFolder: 'inbox',
  notifyNewEmails: true,
  compactView: false,
  filterUnreadFirst: false,
  groupByThread: true,
};

const AdminEmailSettings = ({ onSettingsChange }: EmailSettingsProps) => {
  const [settings, setSettings] = useState<EmailSettings>(() => {
    const saved = localStorage.getItem('admin_email_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });
  const [open, setOpen] = useState(false);

  const updateSetting = <K extends keyof EmailSettings>(key: K, value: EmailSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('admin_email_settings', JSON.stringify(updated));
    onSettingsChange?.(updated);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('admin_email_settings', JSON.stringify(DEFAULT_SETTINGS));
    onSettingsChange?.(DEFAULT_SETTINGS);
    toast.success('Settings reset to defaults');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Email Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Email Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Display Settings */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Maximize2 className="h-4 w-4" /> Display
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Emails per page</Label>
                <Select
                  value={String(settings.emailsPerPage)}
                  onValueChange={(v) => updateSetting('emailsPerPage', Number(v))}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">0 - 10</SelectItem>
                    <SelectItem value="25">0 - 25</SelectItem>
                    <SelectItem value="50">0 - 50</SelectItem>
                    <SelectItem value="100">0 - 100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Show preview pane</Label>
                <Switch checked={settings.showPreviewPane} onCheckedChange={(v) => updateSetting('showPreviewPane', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Compact view</Label>
                <Switch checked={settings.compactView} onCheckedChange={(v) => updateSetting('compactView', v)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Filter Settings */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <ListFilter className="h-4 w-4" /> Filtering & Sorting
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Unread emails first</Label>
                <Switch checked={settings.filterUnreadFirst} onCheckedChange={(v) => updateSetting('filterUnreadFirst', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Group by thread</Label>
                <Switch checked={settings.groupByThread} onCheckedChange={(v) => updateSetting('groupByThread', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Default folder</Label>
                <Select value={settings.defaultFolder} onValueChange={(v) => updateSetting('defaultFolder', v)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbox">Inbox</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="starred">Starred</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Auto-refresh */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Auto-Refresh
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Auto-refresh interval</Label>
                <Select
                  value={String(settings.autoRefreshInterval)}
                  onValueChange={(v) => updateSetting('autoRefreshInterval', Number(v))}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Off</SelectItem>
                    <SelectItem value="30">30 sec</SelectItem>
                    <SelectItem value="60">1 min</SelectItem>
                    <SelectItem value="300">5 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Notify new emails</Label>
                <Switch checked={settings.notifyNewEmails} onCheckedChange={(v) => updateSetting('notifyNewEmails', v)} />
              </div>
            </div>
          </div>

          <Separator />

          <Button variant="outline" onClick={resetSettings} className="w-full">
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEmailSettings;
