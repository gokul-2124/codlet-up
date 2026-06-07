// import axiosInstance from "@/api/pistonApi"
// import { Language, RunContext as RunContextType } from "@/types/run"
// import langMap from "lang-map"
// import {
//     ReactNode,
//     createContext,
//     useContext,
//     useEffect,
//     useState,
// } from "react"
// import toast from "react-hot-toast"
// import { useFileSystem } from "./FileContext"

// const RunCodeContext = createContext<RunContextType | null>(null)

// export const useRunCode = () => {
//     const context = useContext(RunCodeContext)
//     if (context === null) {
//         throw new Error(
//             "useRunCode must be used within a RunCodeContextProvider",
//         )
//     }
//     return context
// }

// const RunCodeContextProvider = ({ children }: { children: ReactNode }) => {
//     const { activeFile } = useFileSystem()
//     const [input, setInput] = useState<string>("")
//     const [output, setOutput] = useState<string>("")
//     const [isRunning, setIsRunning] = useState<boolean>(false)
//     const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([])
//     const [selectedLanguage, setSelectedLanguage] = useState<Language>({
//         language: "",
//         version: "",
//         aliases: [],
//     })

//     useEffect(() => {
//         const fetchSupportedLanguages = async () => {
//             try {
//                 const languages = await axiosInstance.get("/runtimes")
//                 setSupportedLanguages(languages.data)
//             } catch (error: any) {
//                 toast.error("Failed to fetch supported languages")
//                 if (error?.response?.data) console.error(error?.response?.data)
//             }
//         }

//         fetchSupportedLanguages()
//     }, [])

//     // Set the selected language based on the file extension
//     useEffect(() => {
//         if (supportedLanguages.length === 0 || !activeFile?.name) return

//         const extension = activeFile.name.split(".").pop()
//         if (extension) {
//             const languageName = langMap.languages(extension)
//             const language = supportedLanguages.find(
//                 (lang) =>
//                     lang.aliases.includes(extension) ||
//                     languageName.includes(lang.language.toLowerCase()),
//             )
//             if (language) setSelectedLanguage(language)
//         } else setSelectedLanguage({ language: "", version: "", aliases: [] })
//     }, [activeFile?.name, supportedLanguages])

//     const runCode = async () => {
//         try {
//             if (!selectedLanguage) {
//                 return toast.error("Please select a language to run the code")
//             } else if (!activeFile) {
//                 return toast.error("Please open a file to run the code")
//             } else {
//                 toast.loading("Running code...")
//             }

//             setIsRunning(true)
//             const { language, version } = selectedLanguage

//             const response = await axiosInstance.post("/execute", {
//                 language,
//                 version,
//                 files: [{ name: activeFile.name, content: activeFile.content }],
//                 stdin: input,
//             })
//             if (response.data.run.stderr) {
//                 setOutput(response.data.run.stderr)
//             } else {
//                 setOutput(response.data.run.stdout)
//             }
//             setIsRunning(false)
//             toast.dismiss()
//         } catch (error: any) {
//             console.error(error.response.data)
//             console.error(error.response.data.error)
//             setIsRunning(false)
//             toast.dismiss()
//             toast.error("Failed to run the code")
//         }
//     }

//     return (
//         <RunCodeContext.Provider
//             value={{
//                 setInput,
//                 output,
//                 isRunning,
//                 supportedLanguages,
//                 selectedLanguage,
//                 setSelectedLanguage,
//                 runCode,
//             }}
//         >
//             {children}
//         </RunCodeContext.Provider>
//     )
// }

// export { RunCodeContextProvider }
// export default RunCodeContext

import axiosInstance from "@/api/pistonApi"
import { Language, RunContext as RunContextType } from "@/types/run"
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"
import toast from "react-hot-toast"
import { useFileSystem } from "./FileContext"

// Map file extensions to Judge0 language IDs
const EXTENSION_TO_LANGUAGE_ID: Record<string, number> = {
    js: 63,       // JavaScript (Node.js 12.14.0)
    ts: 74,       // TypeScript (3.7.4)
    py: 71,       // Python (3.8.1)
    java: 62,     // Java (OpenJDK 13.0.1)
    c: 50,        // C (GCC 9.2.0)
    cpp: 54,      // C++ (GCC 9.2.0)
    cs: 51,       // C# (Mono 6.6.0.161)
    go: 60,       // Go (1.13.5)
    rs: 73,       // Rust (1.40.0)
    rb: 72,       // Ruby (2.7.0)
    php: 68,      // PHP (7.4.1)
    sh: 46,       // Bash (5.0.0)
    lua: 64,      // Lua (5.3.5)
}

const RunCodeContext = createContext<RunContextType | null>(null)

export const useRunCode = () => {
    const context = useContext(RunCodeContext)
    if (context === null) {
        throw new Error("useRunCode must be used within a RunCodeContextProvider")
    }
    return context
}

const RunCodeContextProvider = ({ children }: { children: ReactNode }) => {
    const { activeFile } = useFileSystem()
    const [input, setInput] = useState<string>("")
    const [output, setOutput] = useState<string>("")
    const [isRunning, setIsRunning] = useState<boolean>(false)
    const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([])
    const [selectedLanguage, setSelectedLanguage] = useState<Language>({
        id: 0,
        name: "",
    })

    useEffect(() => {
        const fetchSupportedLanguages = async () => {
            try {
                const response = await axiosInstance.get("/languages")
                setSupportedLanguages(response.data)
            } catch (error: any) {
                toast.error("Failed to fetch supported languages")
                console.error(error?.response?.data)
            }
        }
        fetchSupportedLanguages()
    }, [])

    // Set the selected language based on the file extension
    useEffect(() => {
        if (supportedLanguages.length === 0 || !activeFile?.name) return

        const extension = activeFile.name.split(".").pop()?.toLowerCase()
        if (extension && EXTENSION_TO_LANGUAGE_ID[extension]) {
            const langId = EXTENSION_TO_LANGUAGE_ID[extension]
            const language = supportedLanguages.find((l) => l.id === langId)
            if (language) setSelectedLanguage(language)
        } else {
            setSelectedLanguage({ id: 0, name: "" })
        }
    }, [activeFile?.name, supportedLanguages])

    // const runCode = async () => {
    //     if (!selectedLanguage?.id) {
    //         return toast.error("Please select a language to run the code")
    //     }
    //     if (!activeFile) {
    //         return toast.error("Please open a file to run the code")
    //     }

    //     try {
    //         toast.loading("Running code...")
    //         setIsRunning(true)

    //         // Step 1: Submit the code
    //         const submission = await axiosInstance.post(
    //             "/submissions?base64_encoded=true&wait=false",
    //             {
    //                 source_code: btoa(activeFile.content),  // encode input
    //                 language_id: selectedLanguage.id,
    //                 stdin: input ? btoa(input) : "",        // encode stdin too
    //             },
    //         )

    //         const token = submission.data.token

    //         // Step 2: Poll for the result
    //         let result = null
    //         for (let i = 0; i < 10; i++) {
    //             await new Promise((r) => setTimeout(r, 1000))
    //             const res = await axiosInstance.get(
    //                 `/submissions/${token}?base64_encoded=true`,  // receive base64
    //             )
    //             if (res.data.status?.id > 2) {
    //                 result = res.data
    //                 break
    //             }
    //         }

    //         if (!result) {
    //             toast.dismiss()
    //             toast.error("Execution timed out")
    //             setIsRunning(false)
    //             return
    //         }

    //         // Decode base64 outputs
    //         const decode = (str: string | null) =>
    //             str ? atob(str) : ""

    //         if (result.stderr) {
    //             setOutput(decode(result.stderr))
    //         } else if (result.compile_output) {
    //             setOutput(decode(result.compile_output))
    //         } else {
    //             setOutput(decode(result.stdout))
    //         }

    //         setIsRunning(false)
    //         toast.dismiss()
    //         toast.success("Code executed successfully")
    //     } catch (error: any) {
    //         console.error(error?.response?.data)
    //         setIsRunning(false)
    //         toast.dismiss()
    //         toast.error("Failed to run the code")
    //     }
    // }

    // Unicode-safe encode/decode helpers
    const encode = (str: string) =>
        btoa(unescape(encodeURIComponent(str)))

    const decode = (str: string | null) =>
        str ? decodeURIComponent(escape(atob(str))) : ""

    const runCode = async () => {
        if (!selectedLanguage?.id) {
            return toast.error("Please select a language to run the code")
        }
        if (!activeFile) {
            return toast.error("Please open a file to run the code")
        }

        try {
            toast.loading("Running code...")
            setIsRunning(true)

            const submission = await axiosInstance.post(
                "/submissions?base64_encoded=true&wait=false",
                {
                    source_code: encode(activeFile.content),
                    language_id: selectedLanguage.id,
                    stdin: input ? encode(input) : "",
                },
            )

            const token = submission.data.token

            let result = null
            for (let i = 0; i < 10; i++) {
                await new Promise((r) => setTimeout(r, 1000))
                const res = await axiosInstance.get(
                    `/submissions/${token}?base64_encoded=true`,
                )
                if (res.data.status?.id > 2) {
                    result = res.data
                    break
                }
            }

            if (!result) {
                toast.dismiss()
                toast.error("Execution timed out")
                setIsRunning(false)
                return
            }

            if (result.stderr) {
                setOutput(decode(result.stderr))
            } else if (result.compile_output) {
                setOutput(decode(result.compile_output))
            } else {
                setOutput(decode(result.stdout))
            }

            setIsRunning(false)
            toast.dismiss()
            toast.success("Code executed successfully")
        } catch (error: any) {
            console.error(error?.response?.data ?? error)
            setIsRunning(false)
            toast.dismiss()
            toast.error("Failed to run the code")
        }
    }
    return (
        <RunCodeContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                supportedLanguages,
                selectedLanguage,
                setSelectedLanguage,
                runCode,
            }}
        >
            {children}
        </RunCodeContext.Provider>
    )
}

export { RunCodeContextProvider }
export default RunCodeContext