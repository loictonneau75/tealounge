/**
 * Asynchronously retrieves a configuration value from the const.json file based on a given key.
 *
 * @async
 * @function getConfigValue
 * @param {string} key - The key to look up in the configuration JSON.
 * @returns {Promise<*>} The value associated with the key, or null if an error occurs.
 * @throws Will log an error to the console if the fetch or JSON parsing fails.
 */
export async function getConfigValue(key){
    try{
        const response = await fetch("../json/const.json");
        const data = await response.json();
        return data[key];
    } catch(error){
        console.error("Erreur lors de la récupération du JSON : ", error);
        return null;
    };
};

/**
 * Asynchronously loads the form configuration and UI labels for the specified language.
 *
 * @async
 * @function loadFormConfig
 * @param {string} lang - The language code (e.g., "en", "fr") used to select the correct UI labels.
 * @returns {Promise<{config: Object, UILabels: Object}>} An object containing the full form configuration and language-specific UI labels.
 */
export async function loadFormConfig(lang){
    const config = await getConfigValue("form");
    const UILabels = config.UILabels[lang];
    return {config, UILabels};
};

/**
 * Converts a snake_case string to Title Case.
 *
 * @function snakeToTitleCase
 * @param {string} str - The snake_case string to convert.
 * @returns {string} The converted string in Title Case.
 */
export function snakeToTitleCase(str){
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Converts a snake_case string to a string with a line break after the first word.
 *
 * @function toLineBreak
 * @param {string} str - The snake_case string to convert.
 * @returns {string} The transformed string with a line break after the first word.
 */
export function toLineBreak(str){
    const parts = str.split('_');
    if (parts.length <= 1) return str;
    return parts[0] + '\n' + parts.slice(1).join(' ');
};

/**
 * Capitalizes the first character of a given string.
 *
 * @function capitalize
 * @param {string} str - The string to capitalize.
 * @returns {string} The string with its first character in uppercase.
 */
export function capitalize(str){
    return String(str[0]).toUpperCase() + String(str).slice(1);
};

/**
 * Throws an error indicating that a required parameter is missing.
 *
 * @function requiredParam
 * @param {string} paramName - The name of the missing parameter.
 * @throws {Error} Always throws an error stating the required parameter is missing.
 */
export function requiredParam(paramName){
    throw new Error(`l'Argument "${paramName}" est requis`);
};