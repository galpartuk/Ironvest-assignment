import type { ActionIDValidateResponse } from './actionid-server';

/**
 * Map ActionID validation result to a user-friendly error message.
 * We inspect common indicator flags exposed by the API.
 *
 * Docs: https://actionid-dev-portal.lovable.app/docs/indicators-reference
 */
export function getActionIDFriendlyError(validation: ActionIDValidateResponse): string {
  const indicators = (validation.indicators ?? {}) as Record<string, any>;

  // Examples based on documented indicator names:
  if (indicators.iv_is_biometrics_collected === false) {
    return 'We could not capture your face. Please ensure your camera is on, your face is fully visible, and try again.';
  }

  if (indicators.iv_is_biometrics_match === false) {
    return 'We could not match your face to this account. Please make sure you are using the correct email or re-enroll.';
  }

  if (indicators.iv_liveness === false) {
    return 'We could not confirm that this was a live person. Please look at the camera and avoid using photos or screens.';
  }

  if (indicators.iv_user_enrolled === false) {
    return 'We do not have a biometric profile for this email yet. Please complete enrollment first.';
  }

  // Fallback if we don’t have a specific indicator.
  return 'We were unable to verify your identity. Please try again in good lighting and ensure your face is clearly visible.';
}

