import React, { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/overlay/dialog';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Copy, Check, Share, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectSlug: string;
  isPublic: boolean;
  onMakePublic: () => Promise<void>;
}

export default function ShareModal({ isOpen, onClose, projectSlug, isPublic, onMakePublic }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [makingPublic, setMakingPublic] = useState(false);
  
  const shareUrl = `${window.location.origin}/crudly-builder?project=${projectSlug}&share`;

  const copyToClipboard = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for non-HTTPS environments
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleMakePublic = async () => {
    setMakingPublic(true);
    try {
      await onMakePublic();
      toast.success('Project is now public and can be shared!');
    } catch (error) {
      toast.error('Failed to make project public');
    } finally {
      setMakingPublic(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 share-title">
            <Share className="w-5 h-5 " />
            Share Project
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!isPublic ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-muted rounded-full">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium mb-2 project-title">Project is Private</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Make your project public to share it with others. Public projects can be viewed and remixed by anyone with the link.
                </p>
                <Button
                  onClick={handleMakePublic}
                  disabled={makingPublic}
                  className="flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  {makingPublic ? 'Making Public...' : 'Make Public & Share'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="share-url" className="text-sm font-medium">
                  Share Link
                </Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    id="share-url"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with this link can view your project and remix it for their own use.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}