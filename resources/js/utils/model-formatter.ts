/**
 * Converts camelCase model names to properly formatted display names
 * PostLog -> Post Logs
 * UserProfile -> User Profiles
 */
export function formatModelName(modelName: string, plural: boolean = true): string {
  if (!modelName) return '';
  
  // Convert camelCase to spaced words
  const spaced = modelName.replace(/([A-Z])/g, ' $1').trim();
  
  if (!plural) return spaced;
  
  // Simple pluralization rules
  if (spaced.endsWith('y')) {
    return spaced.slice(0, -1) + 'ies';
  } else if (spaced.endsWith('s') || spaced.endsWith('sh') || spaced.endsWith('ch') || spaced.endsWith('x') || spaced.endsWith('z')) {
    return spaced + 'es';
  } else {
    return spaced + 's';
  }
}