/**
 * Retrieves and parses data from localStorage for a given key.
 *
 * @function getDataFromLocalStorage
 * @param {string} storageKey - The key used to retrieve data from localStorage.
 * @returns {Array|Object} The parsed data from localStorage, or an empty array if not found.
 */
export function getDataFromLocalStorage(storageKey){
    const rawData = localStorage.getItem(storageKey);
    try {return rawData ? JSON.parse(rawData) : []}
    catch(e) {console.error("Erreur de parsing JSON: ", e)};
};

/**
 * Updates localStorage by merging new values into existing arrays for each specified key.
 * Ensures that stored values are unique.
 *
 * @function updateLocalStorage
 * @param {Array<{key: string, value: string|string[]}>} storageUpdates - An array of objects containing the key and the value(s) to store.
 */
export function updateLocalStorage(storageUpdates){
    storageUpdates.forEach(({ key, value }) => {
        const existing = JSON.parse(localStorage.getItem(key)) || [];
        const newValues = Array.isArray(value) ? value : [value];
        const merged = [...new Set([...existing, ...newValues])];
        localStorage.setItem(key, JSON.stringify(merged));
    });
};

/**
 * Converts an array of field-value pairs into a structured object for storage.
 *
 * @function structureDataToStore
 * @param {Array<{fieldname: string, value: any}>} values - An array of objects containing field names and their corresponding values.
 * @returns {Object} An object mapping field names to their values.
 */
export function structureDataToStore(values){
    const data = {};
    values.forEach(({ fieldname, value }) => {data[fieldname] = value});
    return data;
};

/**
 * Stores the provided data in localStorage under a site-specific key if it doesn't already exist.
 * Uses deep equality (via JSON.stringify) to check for duplicates.
 *
 * @async
 * @function storeDataIfNew
 * @param {Object} dataToStore - The data object to be stored.
 * @returns {Promise<void>} Resolves when the data is stored or skipped if already present.
 */
export function storeDataIfNew(dataToStore, key){
    const existingData = JSON.parse(localStorage.getItem(key)) || [];
    const alreadyExists = existingData.some(item => JSON.stringify(item) === JSON.stringify(dataToStore));
    if (!alreadyExists){
        existingData.push(dataToStore);
        localStorage.setItem(key, JSON.stringify(existingData));
    };
};

/**
 * Supprime une entrée dans localStorage par son index.
 * @param {string} key - La clé de localStorage.
 * @param {number} index - L'index de l'élément à supprimer.
 */
export function deleteDataByIndex(key, index) {
    const allData = JSON.parse(localStorage.getItem(key)) || [];
    if (index < 0 || index >= allData.length) return;
    allData.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(allData));
}

