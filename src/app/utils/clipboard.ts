/**
 * Copies text to the clipboard with a fallback for older browsers.
 *
 * @param text - Text content to copy.
 * @returns Promise resolving to true when copy succeeds.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to fallback
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  textarea.setAttribute('readonly', '');
  document.body.appendChild(textarea);

  textarea.select();
  textarea.setSelectionRange(0, 99999);

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch {
    success = false;
  } finally {
    document.body.removeChild(textarea);
  }

  return success;
}
