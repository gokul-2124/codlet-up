// import axios, { AxiosInstance } from "axios"

// const pollinationsBaseUrl = "https://text.pollinations.ai"
// // const pollinationsBaseUrl = "https://gen.pollinations.ai/text"

// const instance: AxiosInstance = axios.create({
//     baseURL: pollinationsBaseUrl,
//     headers: {
//         "Content-Type": "application/json",
//     },
// })

// export default instance

import axios, { AxiosInstance } from "axios"

const instance: AxiosInstance = axios.create({
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5173", // your app's URL
        "X-Title": "Code Sync",                  // your app's name
    },
})

export default instance