import * as utils from "./utils.js"

export function updateLocalStorage(storageUpdates) {
        storageUpdates.forEach(({ key, value }) => {
            const existing = JSON.parse(localStorage.getItem(key)) || [];
            const newValues = Array.isArray(value) ? value : [value];
            const merged = [...new Set([...existing, ...newValues])];
            localStorage.setItem(key, JSON.stringify(merged));
        });
    }

export function structureDataToStore(values) {
    const data = {};
    values.forEach(({ fieldname, value }) => {
        data[fieldname] = value;
    });
    return data;
}

export async function storeDataIfNew(dataToStore) {
        const key = await utils.getConfigValue("siteName");
        const existingData = JSON.parse(localStorage.getItem(key)) || [];
    
        const alreadyExists = existingData.some(item =>
            JSON.stringify(item) === JSON.stringify(dataToStore)
        );
    
        if (!alreadyExists) {
            existingData.push(dataToStore);
            localStorage.setItem(key, JSON.stringify(existingData));
        }
    }