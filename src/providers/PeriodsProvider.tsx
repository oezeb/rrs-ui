import React from "react";
import { TimeDelta } from "utils/util";
import { paths as api_paths } from "utils/api";

interface PeriodsProviderContextType {
    periods: Record<string, any>[];
    loading: boolean;
};

const PeriodsProviderContext = React.createContext<PeriodsProviderContextType>(null!);

function PeriodsProvider(props: { children: React.ReactNode }) {
    const [periods, setPeriods] = React.useState<Record<string, any>[]>([]);
    const [loading, setLoading] = React.useState(true);

    const periodsMemo = React.useMemo(async () => {
        let res = await fetch(api_paths.periods);
        let json = await res.json();
        let periods = json.map((p: any) => ({
            ...p,
            start_time: TimeDelta.from(p.start_time),
            end_time: TimeDelta.from(p.end_time)
        }));
        return periods;
    }, []);

    React.useEffect(() => {
        periodsMemo.then((periods) => {
            setPeriods(periods);
            setLoading(false);
        });
    }, [periodsMemo]);

    return (
        <PeriodsProviderContext.Provider value={{ periods, loading }}>
            {props.children}
        </PeriodsProviderContext.Provider>
    );
}

export function usePeriods() {
    return React.useContext(PeriodsProviderContext);
}

export default PeriodsProvider;