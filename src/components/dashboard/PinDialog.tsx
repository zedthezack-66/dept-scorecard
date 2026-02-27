import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/lib/admin-store';
import { Lock } from 'lucide-react';

interface PinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PinDialog = ({ open, onOpenChange, onSuccess }: PinDialogProps) => {
  const { unlock } = useAdmin();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (unlock(pin)) {
      setPin('');
      setError(false);
      onOpenChange(false);
      onSuccess();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 800);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setPin(''); setError(false); }}>
      <DialogContent className="max-w-xs text-center">
        <DialogHeader className="items-center">
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-primary">
            <Lock size={24} className="text-accent" />
          </div>
          <DialogTitle className="font-display text-[24px] tracking-[3px]">Admin Access</DialogTitle>
          <DialogDescription>Enter the 4-digit PIN to continue</DialogDescription>
        </DialogHeader>

        <div className={`flex justify-center py-4 ${error ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
          <InputOTP maxLength={4} value={pin} onChange={setPin} onComplete={handleSubmit}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="h-14 w-14 text-[22px] font-display" />
              <InputOTPSlot index={1} className="h-14 w-14 text-[22px] font-display" />
              <InputOTPSlot index={2} className="h-14 w-14 text-[22px] font-display" />
              <InputOTPSlot index={3} className="h-14 w-14 text-[22px] font-display" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-[13px] font-semibold text-destructive">Incorrect PIN — try again</p>}

        <Button onClick={handleSubmit} disabled={pin.length < 4} className="w-full mt-2 font-display text-[16px] tracking-[2px]">
          Unlock
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PinDialog;
