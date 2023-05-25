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
    const lang = location.pathname.startsWith("/en/") || location.pathname === "/en" ? "en" : "zh";
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
    if (lang === "zh") {
        return path;
    } else {
        return "/en" + path;
    }
}

export { LangProvider, useLang, to };