import { useEffect, useState } from 'react';
import { pingExtension } from './extensionBridge';

/** true when the extension answers, false when it does not, null while checking. Re-checks on tab focus. */
export function useExtensionStatus(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    const check = () => pingExtension().then((v) => alive && setOk(v));
    check();
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return ok;
}
