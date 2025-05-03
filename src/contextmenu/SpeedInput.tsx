import { InputAdornment, TextField } from "@mui/material";
import { useState } from "react";
import { usePlayerStorage } from "../state/usePlayerStorage";

interface SpeedInputProps {
    value: number;
    onChange: (speed: number) => void;
}

export const SpeedInput: React.FC<SpeedInputProps> = ({ value, onChange }) => {
    const grid = usePlayerStorage((state) => state.grid);
    const [oldValue, setOldValue] = useState(value);
    const [displayValue, setDisplayValue] = useState(value.toString()); // value that's not necessarily valid

    if (value !== oldValue) {
        setOldValue(value);
        setDisplayValue(value.toString());
    }

    return (
        <TextField
            type="number"
            size="small"
            sx={{ maxWidth: 120 }}
            slotProps={{
                htmlInput: {
                    min: grid.parsedScale.multiplier,
                    step: grid.parsedScale.multiplier,
                },
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            {grid.parsedScale.unit}
                        </InputAdornment>
                    ),
                },
            }}
            value={displayValue}
            onChange={(e) => {
                setDisplayValue(e.currentTarget.value);
                const size = parseFloat(e.currentTarget.value);
                if (Number.isSafeInteger(size) && size > 0) {
                    onChange(size);
                }
            }}
        />
    );
};
