export async function getConfigValue(key) {
    try{
        const response = await fetch("../json/const.json");
        const data = await response.json();
        return data[key];
    } catch(error){
        console.error("Erreur lors de la récupération du JSON : ", error);
        return null
    }
};