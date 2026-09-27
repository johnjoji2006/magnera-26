import { useEffect } from "react";
import { initRealm } from "../lib/realm.js";

// Runs a realm page's portal-hero/scroll/back-warp logic once its JSX has mounted.
// See src/lib/realm.js.
export function useRealmFX(realm) {
  useEffect(() => {
    const dispose = initRealm(realm);
    return dispose;
  }, [realm]);
}
