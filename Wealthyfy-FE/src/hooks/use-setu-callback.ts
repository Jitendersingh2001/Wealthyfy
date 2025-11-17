import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { ROUTES } from "@/routes/routes";

/* ------------------------------ Types ------------------------------------- */
interface SetuError {
  code?: string;
  message?: string;
}

interface SetuCallbackParams {
  success?: string | null;
  id?: string | null;
  errorCode?: string | null;
  errorMsg?: string | null;
}

interface UseSetuCallbackReturn {
  isSetuCallback: boolean;
  setuError: SetuError | null;
  shouldRedirect: boolean;
  redirectPath: string | null;
}

/* ---------------------------- Hook Definition ----------------------------- */
export function useSetuCallback(
  onCallbackDetected?: (step: number) => void,
  currentPath?: string
): UseSetuCallbackReturn {
  /* -------------------------- State & Refs ------------------------------- */
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isSetuCallback, setIsSetuCallback] = useState(false);
  const [setuError, setSetuError] = useState<SetuError | null>(null);
  const callbackRef = useRef(onCallbackDetected);

  /* ----------------------------- Sync Callback ---------------------------- */
  useEffect(() => {
    callbackRef.current = onCallbackDetected;
  }, [onCallbackDetected]);

  /* ------------------------ Extract Query Params ------------------------- */
  const setuParams = useMemo<SetuCallbackParams>(() => ({
    success: searchParams.get("success"),
    id: searchParams.get("id"),
    errorCode: searchParams.get("errorcode"),
    errorMsg: searchParams.get("errormsg"),
  }), [searchParams]);

  const hasSetuParams = useMemo(() => {
    const { success, id, errorCode, errorMsg } = setuParams;
    return Boolean((success !== null && id) || errorCode || errorMsg);
  }, [setuParams]);

  /* ---------------------------- Routing Logic ---------------------------- */
  const pathname = currentPath || location.pathname;
  const isInitiateSetupRoute = pathname === ROUTES.INITIATE_SETUP;
  const shouldRedirect = hasSetuParams && !isInitiateSetupRoute;

  const redirectPath = useMemo(() => {
    if (!shouldRedirect) return null;

    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(setuParams).filter(([, value]) => value !== null)
      )
    );

    return `${ROUTES.INITIATE_SETUP}${params.toString() ? `?${params.toString()}` : ""}`;
  }, [shouldRedirect, setuParams]);

  /* ---------------------- Callback State Management ---------------------- */
  useEffect(() => {
    if (!hasSetuParams) {
      setIsSetuCallback(false);
      setSetuError(null);
      return;
    }

    const { success, id, errorCode, errorMsg } = setuParams;
    let error: SetuError | null = null;

    if (success === "true" && id) {
      // Success case
      error = null;
    } else if (success === "false" || errorCode || errorMsg) {
      // Error case
      error = {
        code: errorCode || undefined,
        message: errorMsg || "An error occurred during the consent process",
      };
    } else if (id) {
      // Edge case: id without explicit success
      error = null;
    }

    setIsSetuCallback(true);
    setSetuError(error);
    callbackRef.current?.(4);
  }, [hasSetuParams, setuParams]);

  /* ------------------------------- Return -------------------------------- */
  return { isSetuCallback, setuError, shouldRedirect, redirectPath };
}
