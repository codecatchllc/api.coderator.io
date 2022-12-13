/**
 * @param {string} word - The word that will be capitalized
 * @returns {string} The capitalized version of the word param
 */
export default function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}