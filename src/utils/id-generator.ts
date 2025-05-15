/**
 * Custom ID generator for the application
 * (This is a wrapper around UUID v4 to comply with linting rules)
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID
 * @returns A unique string ID
 */
export function generateId(): string {
	return uuidv4();
}