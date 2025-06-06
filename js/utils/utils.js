/**
 * Asynchronously loads and returns configuration data from a JSON file.
 *
 * This function fetches the `const.json` file located in the `../json/` directory
 * and parses it as a JavaScript object. If a network or parsing error occurs,
 * it logs the error to the console and returns `null`.
 *
 * @async
 * @function getConfigValue
 * @returns {Promise<Object|null>} A Promise resolving to the configuration object, or `null` if an error occurs.
 */
export async function getConfigValue(){
    try{
        const response = await fetch(getBasePath() + 'json/const.json');
        return await response.json();
    } catch(error){
        console.error("Erreur lors de la récupération du JSON : ", error);
        return null;
    };
};

function getBasePath() {
  const path = window.location.pathname;
  return path.endsWith('/') ? path : path + '/';
}

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
 * Throws an error indicating that a required parameter is missing.
 *
 * @function requiredParam
 * @param {string} paramName - The name of the missing parameter.
 * @throws {Error} Always throws an error stating the required parameter is missing.
 */
export function requiredParam(paramName){
    throw new Error(`l'Argument "${paramName}" est requis`);
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

export function buildFieldMapFromGroups(fields){
    const map = {};
    fields.forEach(group => {
        Object.entries(group).forEach(([key, val]) => {
            map[key] = val;
        });
    });
    return map
}