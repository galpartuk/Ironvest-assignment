'use client';

import { useCallback, useEffect, useRef } from 'react';
import { ACTIONID_CONFIG } from '@/lib/actionid-config';

const CAMERA_CONTAINER_ID = 'actionid-camera-container';

export type CameraPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

export function useActionID() {
  const instanceRef = useRef<any>(null);
  const csidRef = useRef('');

  const safeCleanup = useCallback((instance: any) => {
    if (!instance) return;
    try {
      if (typeof instance.stopBiometric === 'function') instance.stopBiometric();
      if (typeof instance.destroy === 'function') instance.destroy();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    return () => {
      safeCleanup(instanceRef.current);
      instanceRef.current = null;
    };
  }, [safeCleanup]);

  const initialize = useCallback((uid: string) => {
    if (typeof window === 'undefined' || !(window as any).Ironvest) {
      throw new Error('ActionID SDK not loaded (window.Ironvest missing).');
    }
    safeCleanup(instanceRef.current);
    instanceRef.current = null;

    const csid = crypto.randomUUID();
    csidRef.current = csid;

    // The SDK script provides window.Ironvest
    const Ironvest = (window as any).Ironvest;
    const instance = new Ironvest({
      cid: ACTIONID_CONFIG.cid,
      csid,
      uid,
      baseURL: ACTIONID_CONFIG.baseURL,
      debug: ACTIONID_CONFIG.debug,
    });

    if (typeof instance.setCsid === 'function') instance.setCsid(csid);
    if (typeof instance.setUid === 'function') instance.setUid(uid);
    instanceRef.current = instance;
  }, [safeCleanup]);

  /**
   * Uses the SDK's getPermissionsStatus() to check camera permission state.
   * Returns: 'granted' | 'denied' | 'prompt' | 'unknown'
   */
  const getPermissionStatus = useCallback(async (): Promise<CameraPermissionStatus> => {
    if (!instanceRef.current) {
      // If SDK is not initialized, fall back to browser permission API
      if (typeof navigator !== 'undefined' && navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          return result.state as CameraPermissionStatus;
        } catch {
          return 'unknown';
        }
      }
      return 'unknown';
    }

    try {
      const status = await instanceRef.current.getPermissionsStatus();
      return status?.camera || 'unknown';
    } catch {
      return 'unknown';
    }
  }, []);

  const startBiometric = useCallback(
    (containerId: string = CAMERA_CONTAINER_ID, actionID?: string) => {
      if (!instanceRef.current) {
        throw new Error('Camera is not ready yet. Please try again.');
      }
      instanceRef.current.startBiometricSession(containerId, {
        size: 'fill',
        opacity: 1,
        useVirtualAvatar: false,
        frequency: 2000,
        ...(actionID ? { action: actionID, actionID } : {}),
      });
    },
    []
  );

  const stop = useCallback(() => {
    if (instanceRef.current) {
      safeCleanup(instanceRef.current);
      instanceRef.current = null;
    }
  }, [safeCleanup]);

  /**
   * Proactively requests camera access and translates common browser errors
   * into user‑friendly messages. This lets us surface clear feedback before
   * booting the SDK.
   */
  const ensureCameraPermission = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera access is not supported in this browser.');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // We only need to prompt for permission; immediately stop the stream.
      stream.getTracks().forEach((track) => track.stop());
    } catch (err: any) {
      const name = err?.name;

      if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
        throw new Error('Camera access was denied. Please enable camera permissions in your browser settings and try again.');
      }

      if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
        throw new Error('No camera was found. Please check that a camera is connected and not in use by another application.');
      }

      throw new Error('We were unable to access your camera. Please check your device and try again.');
    }
  }, []);

  const getCsid = useCallback(() => csidRef.current, []);

  return {
    initialize,
    startBiometric,
    stop,
    ensureCameraPermission,
    getPermissionStatus,
    getCsid,
    cameraContainerId: CAMERA_CONTAINER_ID,
  };
}
