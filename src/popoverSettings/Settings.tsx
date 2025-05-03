import {
    Box,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    Switch,
    Typography,
} from "@mui/material";
import { Control } from "owlbear-utils";
import { SpeedInput } from "../contextmenu/SpeedInput";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function Settings() {
    const contextMenuEnabled = usePlayerStorage(
        (store) => store.contextMenuEnabled,
    );
    const setContextMenuEnabled = usePlayerStorage(
        (store) => store.setContextMenuEnabled,
    );
    const defaultSpeed = usePlayerStorage((store) => store.defaultSpeed);
    const setDefaultSpeed = usePlayerStorage((store) => store.setDefaultSpeed);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6">Dragtool Settings</Typography>
            <FormGroup sx={{ mb: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={contextMenuEnabled}
                            onChange={(e) =>
                                setContextMenuEnabled(e.target.checked)
                            }
                        />
                    }
                    label="Enable Context Menu"
                />
                <FormHelperText>
                    Enable a context menu item that allows you to set the
                    movement speed of tokens.
                </FormHelperText>
            </FormGroup>
            <Control label="Default Speed">
                <SpeedInput value={defaultSpeed} onChange={setDefaultSpeed} />
            </Control>
        </Box>
    );
}
