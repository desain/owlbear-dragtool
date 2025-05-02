import {
    Box,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    Switch,
    Typography,
} from "@mui/material";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function Settings() {
    const contextMenuEnabled = usePlayerStorage(
        (store) => store.contextMenuEnabled,
    );
    const setContextMenuEnabled = usePlayerStorage(
        (store) => store.setContextMenuEnabled,
    );

    return (
        <Box sx={{ p: 2, minWidth: 300 }}>
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
        </Box>
    );
}
