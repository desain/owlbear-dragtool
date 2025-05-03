import type { TextFieldProps } from "@mui/material";
import { InputAdornment, TextField } from "@mui/material";
import { useState } from "react";
import { usePlayerStorage } from "../state/usePlayerStorage";

type SpeedInputProps = Omit<TextFieldProps, "onChange"> & {
    value: number;
    onChange: (speed: number) => void;
};

export const SpeedInput: React.FC<SpeedInputProps> = ({
    value,
    onChange,
    ...props
}) => {
    const grid = usePlayerStorage((state) => state.grid);
    const [oldValue, setOldValue] = useState(value);
    const [displayValue, setDisplayValue] = useState(value.toString()); // value that's not necessarily valid

    if (value !== oldValue) {
        setOldValue(value);
        setDisplayValue(value.toString());
    }

    return (
        <TextField
            {...props}
            type="number"
            size="small"
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
