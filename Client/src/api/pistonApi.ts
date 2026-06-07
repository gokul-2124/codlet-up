// import axios, { AxiosInstance } from "axios"

// const pistonBaseUrl = "https://emkc.org/api/v2/piston"

// const instance: AxiosInstance = axios.create({
//     baseURL: pistonBaseUrl,
//     headers: {
//         "Content-Type": "application/json",
//     },
// })

// export default instance

import axios, { AxiosInstance } from "axios"

const instance: AxiosInstance = axios.create({
    baseURL: "https://ce.judge0.com",
    headers: {
        "Content-Type": "application/json",
    },
})

export default instance