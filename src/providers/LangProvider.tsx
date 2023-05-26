import React from "react";
import { useLocation } from "react-router-dom";

interface LangProviderContextType {
    lang: "zh" | "en";
};

const LangProviderContext = React.createContext<LangProviderContextType>(null!);

function LangProvider(props: { children: React.ReactNode }) {
    const location = useLocation();   
    // any path that starts with /en/ is considered English
    // any other path is considered Chinese
    const lang = _lang(location.pathname);
    return (
        <LangProviderContext.Provider value={{ lang }}>
            {props.children}
        </LangProviderContext.Provider>
    );
}

function useLang() {
    return React.useContext(LangProviderContext).lang;
}

const to = (path: string, lang: "zh" | "en") => {
    const path_lang = _lang(path);
    if (lang === "zh") {
        if (path_lang === "zh") {
            return path;
        } else {
            return path.replace(`/${path_lang}`, "");
        }
    } else {
        if (path_lang === "en") {
            return path;
        } else {
            return "/en" + path;
        }
    }
}

const _lang = (path: string): "zh" | "en" => path.startsWith("/en/") || path === "/en" ? "en" : "zh";

export { LangProvider, useLang, to };