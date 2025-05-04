export async function getConfigValue(key) {
    try{
        const response = await fetch("../json/const.json");
        const data = await response.json();
        return data[key];
    } catch(error){
        console.error("Erreur lors de la récupération du JSON : ", error);
        return null;
    }
};

export async function loadFormConfig(lang) {
    const config = await getConfigValue("form");
    const UILabels = config.UILabels[lang]
    return {config, UILabels};
}

export function snakeToTitleCase(str) {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function toLineBreak(str) {
    const parts = str.split('_');
    if (parts.length <= 1) return str;
    return parts[0] + '\n' + parts.slice(1).join(' ');
}

export function capitalize(s){
    return String(s[0]).toUpperCase() + String(s).slice(1);
}