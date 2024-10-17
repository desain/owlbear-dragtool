import installDragTool from "./dragtool/src/install";
import ready from "./ready";

async function install() {
    const uninstallers = await Promise.all([
        installDragTool(),
    ]);
    return () => uninstallers.forEach(uninstaller => uninstaller());
}

ready(install);